import json
import unittest

from dailysafe import aggregate, judge_messages, parse_judgment, replay


class EvaluationProtocol(unittest.TestCase):
    def setUp(self):
        self.case = {
            "case_id": "internal-id",
            "turns": [
                {"turn_id": 1, "user_text_en": "earlier", "image_index": 0},
                {"turn_id": 2, "user_text_en": "later", "image_index": None},
            ],
            "images": [{"bytes": b"\x89PNG\r\n\x1a\nfixture"}],
        }
        self.ref = {
            "critical_turn": 2,
            "safety_note_en": {"risk": "reference for the judge only"},
            "image_descriptions_en": [{"turn_id": 1, "description": "visual description"}],
        }
        self.calls = []

    def target(self, messages):
        self.calls.append(messages)
        return f"reply {len(self.calls)}"

    def test_sequential_replay_preserves_only_available_evidence(self):
        answers = replay(self.case, self.target, reference=self.ref)
        self.assertEqual(len(self.calls), 2)
        self.assertNotIn("later", json.dumps(self.calls[0]))
        self.assertEqual(self.calls[0][0]["content"][1]["type"], "image_url")
        self.assertEqual(self.calls[1][1], {"role": "assistant", "content": "reply 1"})
        self.assertNotIn("reference for the judge", json.dumps(self.calls))
        self.assertNotIn("internal-id", json.dumps(self.calls))
        self.assertEqual(answers[1], {"turn_id": 2, "text": "reply 2"})
        judged = json.dumps(judge_messages(self.case, answers, self.ref, "en", "full", "rubric"))
        self.assertIn("reference for the judge", judged)
        self.assertIn("data:image/png;base64,", judged)

    def test_ablations_and_consolidation(self):
        for condition, expects in [
            ("text-only", ["earlier"]),
            ("image-description", ["earlier", "Image description: visual description"]),
        ]:
            self.calls.clear()
            replay(self.case, self.target, condition=condition, reference=self.ref)
            self.assertEqual([part["text"] for part in self.calls[0][0]["content"]], expects)
        self.calls.clear()
        answers = replay(self.case, self.target, condition="consolidated", reference=self.ref)
        self.assertEqual(len(self.calls), 1)
        self.assertIn("earlier", json.dumps(self.calls))
        self.assertIn("later", json.dumps(self.calls))
        self.assertEqual(answers, [{"turn_id": 2, "text": "reply 1"}])

    def test_missing_or_invalid_rows_remain_in_denominator(self):
        values = {"A": {"status": "ok", "sr": True, "hr": False},
                  "B": {"status": "ok", "sr": 1, "hr": 1}}
        report = aggregate(["A", "B", "C"], values)
        self.assertEqual((report["valid_judgments"], report["missing_or_invalid"]), (1, 2))
        self.assertAlmostEqual(report["sr_pct"], 100 / 3, places=3)
        self.assertEqual(report["hr_pct"], 0)
        with self.assertRaises(ValueError):
            parse_judgment('{"sr":1,"hr":true,"sr_reason":"unsafe","hr_reason":"helped"}')


if __name__ == "__main__":
    unittest.main()
