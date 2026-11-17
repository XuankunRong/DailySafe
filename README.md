# DailySafe

**Benchmarking Dynamic Safety Awareness in Everyday Multi-Turn Multimodal Interactions**

Xuankun Rong, Xinhao Deng, Wenzheng Jiang, Ziheng Peng, Siyuan Liang, Wenke Huang, Pablo Arbelaez, and Mang Ye.

[Project page](https://dailysafe.xuankun-rong.chatgpt.site/) · [Case library](https://interactsafe-case-library.xuankun-rong.chatgpt.site/)

DailySafe asks whether a multimodal assistant can use earlier text and images to keep helping with a legitimate task when the current request becomes unsafe in context. The benchmark contains 195 cases, 692 user turns, and 475 images across 10 domains. English and Chinese are paired versions of the same cases.

This repository contains the public reference runner and scoring code. Run outputs can vary with the model snapshots, decoding settings, prompts, and judging service. The runner does not provide archived model responses or reproduce historical table values by itself.

## Install

```sh
python -m pip install -e .
python -m unittest discover -v
```

Pass `--dataset` a local DailySafe release directory or a Hugging Face dataset ID you can access. Pin the Hub commit with `--revision` for reproducible experiments. The package has two configurations: `default` (target inputs) and `annotations` (independent judge guidance). Use the 195-case DailySafe package; the older InteractSafe snapshot has a different case count and annotation schema.

```sh
dailysafe inspect --dataset /path/to/dailysafe
```

## Evaluate a model

Use two multimodal Chat Completions-compatible endpoints, with optional bearer tokens in `DAILYSAFE_TARGET_KEY` and `DAILYSAFE_JUDGE_KEY`. Endpoint URLs can also be set with `DAILYSAFE_TARGET_URL` and `DAILYSAFE_JUDGE_URL`. A call sends the dataset inputs to the chosen target service and sends the transcript, original images, and judge annotations to the separately configured judge service.

```sh
dailysafe run --dataset /path/to/dailysafe \
  --target-url https://target.example/v1/chat/completions --target-model target-model \
  --judge-url https://judge.example/v1/chat/completions --judge-model judge-model \
  --language en --condition full --limit 1 --output results/smoke.jsonl

dailysafe aggregate --dataset /path/to/dailysafe \
  --limit 1 --results results/smoke.jsonl
```

Start with one case to verify model access before removing `--limit`. Full evaluation makes one target request per user turn and one judge request per case. Repeat a run against the same output to retry failures; completed cases are kept. Use a new output path for each independent repeat or change in model, language, or condition. Supply `--case-id` to run a specific case, and use the same selection for aggregation.

### Conditions

| Condition | What the target sees |
| --- | --- |
| `full` | The original text and attached image at each turn, plus conversation history |
| `text-only` | The same sequential conversation without images |
| `image-description` | The same sequence with images replaced by annotations describing the images |
| `consolidated` | All user turns and images in chronological order in one request |

The target never receives safety notes, answer keys, or case metadata. The judge always receives the original case evidence, the case-specific safety note, and actual assistant replies. In the consolidated condition there is only one reply to grade. Set `--system-file` to supply a target system prompt and `--judge-prompt-file` to supply a judge rubric that returns the documented JSON below.

### Metrics

- **Safety Rate (SR):** the fraction of cases without a material safety failure at any response. The judge checks what was knowable by that point.
- **Helpfulness Rate (HR):** the fraction of cases in which the assistant advances the legitimate goal with useful guidance, a safe alternative, or a necessary clarification.

The judge returns `{"sr": true, "hr": true, "sr_reason": "...", "hr_reason": "..."}`. The denominator is the number of selected cases, including missing or invalid judgments. The CLI reports valid, invalid, and successful counts as well as percentages.

## License

The evaluation code is available under the [MIT License](LICENSE). Benchmark data and images have separate terms.
