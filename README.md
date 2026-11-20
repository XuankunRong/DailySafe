<div align="center">
  <img src="docs/assets/dailysafe-icon.png" width="88" alt="DailySafe icon">
  <h1>DailySafe</h1>
  <p><strong>Benchmarking Dynamic Safety Awareness in Everyday Multi-Turn Multimodal Interactions</strong></p>
  <p>Xuankun Rong<sup>1,2</sup>, Xinhao Deng<sup>2,3</sup>, Wenzheng Jiang<sup>4</sup>, Ziheng Peng<sup>2,5</sup>,<br>Siyuan Liang<sup>6</sup>, Wenke Huang<sup>6</sup>, Pablo Arbelaez<sup>7</sup>, Mang Ye<sup>1</sup></p>
  <p><sup>1</sup> Wuhan University · <sup>2</sup> Ant Group · <sup>3</sup> Tsinghua University<br>
  <sup>4</sup> State Key Laboratory of Complex &amp; Critical Software Environment<br>
  <sup>5</sup> Renmin University of China · <sup>6</sup> Nanyang Technological University · <sup>7</sup> Universidad de Los Andes</p>
  <p><a href="https://xuankunrong.github.io/DailySafe/"><strong>Project Page</strong></a> · <a href="https://arxiv.org/abs/2611.26298"><strong>arXiv</strong></a> · <a href="https://arxiv.org/pdf/2611.26298"><strong>PDF</strong></a> · <a href="https://huggingface.co/datasets/XuankunRong/DailySafe"><strong>Hugging Face Dataset</strong></a></p>
</div>

## Benchmark

DailySafe asks whether a multimodal assistant can use earlier text and images to keep helping with a legitimate task when the current request becomes unsafe in context. Its English test set contains **195 cases, 692 user turns, and 475 images**, covering 10 domains and 42 task categories. See the project page for interactive examples.

<p align="center"><img src="docs/assets/paper-figure-1.png" width="425" alt="Paper Figure 1: Motivation for dynamic safety awareness"></p>
<p align="center"><em>Figure 1. Motivation for dynamic safety awareness.</em></p>

<p align="center"><img src="docs/assets/paper-figure-2.png" width="840" alt="Paper Figure 2: DailySafe construction pipeline"></p>
<p align="center"><em>Figure 2. DailySafe construction pipeline.</em></p>

<p align="center"><img src="docs/assets/paper-figure-3.png" width="425" alt="Paper Figure 3: Domain and task distribution"></p>
<p align="center"><em>Figure 3. Domain and task distribution.</em></p>

## Main results

**Table 1. Performance of 16 MLLMs on DailySafe.** Safety Rate (SR) and Helpfulness Rate (HR) are percentages reported as mean ± sample standard deviation across three runs. Higher is better. The [interactive leaderboard](https://xuankunrong.github.io/DailySafe/#leaderboard) supports sorting by either metric.

| Model family | Model | SR (%) ↑ | HR (%) ↑ |
| --- | --- | ---: | ---: |
| Proprietary Models | GPT-6 Sol | 92.48 ± 2.92 | 94.53 ± 2.82 |
| Proprietary Models | GPT-5.6 Sol | 81.71 ± 3.41 | 85.30 ± 2.37 |
| Proprietary Models | Claude Opus 5.5 | 92.65 ± 1.07 | 94.53 ± 0.30 |
| Proprietary Models | Claude Sonnet 5 | 55.04 ± 3.09 | 60.51 ± 2.24 |
| Proprietary Models | Gemini 3.8 Flash | 82.91 ± 0.59 | 87.52 ± 0.78 |
| Proprietary Models | Gemini 3.5 Flash | 70.77 ± 3.20 | 76.07 ± 2.53 |
| Proprietary Models | Gemini 3.1 Pro Preview | 83.42 ± 3.13 | 84.96 ± 3.09 |
| Large Open-weight Models | Kimi-K3 | 71.97 ± 1.29 | 77.78 ± 1.65 |
| Large Open-weight Models | GLM-5.3-Flash | 63.25 ± 1.80 | 69.57 ± 2.07 |
| Large Open-weight Models | Qwen3.8-Flash-Next | 55.56 ± 3.60 | 62.22 ± 3.78 |
| Large Open-weight Models | DeepSeek-V4.1-Flash | 41.03 ± 2.71 | 44.44 ± 3.41 |
| Large Open-weight Models | MiMo-V2.6-Pro | 45.81 ± 0.59 | 52.31 ± 2.35 |
| Large Open-weight Models | MiMo-V2.6-Flash | 30.60 ± 1.07 | 36.07 ± 2.53 |
| Compact Open-weight Models | Qwen3.8-27B | 42.39 ± 2.53 | 47.86 ± 2.07 |
| Compact Open-weight Models | Qwen3-VL-8B-Thinking | 6.15 ± 0.00 | 8.38 ± 0.78 |
| Compact Open-weight Models | Qwen3-VL-8B-Instruct | 2.91 ± 0.30 | 3.93 ± 1.29 |

This repository contains the reference runner and scoring code. Run outputs can vary with model snapshots, decoding settings, prompts, and judging service. The runner does not provide archived model responses or reproduce historical table values by itself.

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
  --condition full --limit 1 --output results/smoke.jsonl

dailysafe aggregate --dataset /path/to/dailysafe \
  --limit 1 --results results/smoke.jsonl
```

Start with one case to verify model access before removing `--limit`. Full evaluation makes one target request per user turn and one judge request per case. Repeat a run against the same output to retry failures; completed cases are kept. Use a new output path for each independent repeat or change in model or condition. Supply `--case-id` to run a specific case, and use the same selection for aggregation.

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

## Citation

~~~bibtex
@misc{rong2026dailysafe,
  author = {Rong, Xuankun and Deng, Xinhao and Jiang, Wenzheng and Peng, Ziheng and
            Liang, Siyuan and Huang, Wenke and Arbelaez, Pablo and Ye, Mang},
  title = {{DailySafe}: Benchmarking Dynamic Safety Awareness in Everyday
           Multi-Turn Multimodal Interactions},
  year = {2026},
  eprint = {2611.26298},
  archivePrefix = {arXiv},
  primaryClass = {cs.CR},
  url = {https://arxiv.org/abs/2611.26298}
}
~~~

## License

The evaluation code is available under the [MIT License](LICENSE). Benchmark data and images have separate terms.
