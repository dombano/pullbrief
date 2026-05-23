# pullbrief

> GitHub Action that auto-generates concise PR summaries from diff and commit messages.

---

## Installation

```bash
npm install
npm run build
```

---

## Usage

Add the following step to your GitHub Actions workflow:

```yaml
name: PR Summary

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  summarize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Generate PR Summary
        uses: your-org/pullbrief@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          max-length: 200
```

Once configured, **pullbrief** will automatically post a concise summary as a comment on every pull request, highlighting key changes derived from the diff and commit history.

---

## Configuration

| Input | Description | Default |
|-------|-------------|---------|
| `github-token` | GitHub token for API access | **required** |
| `max-length` | Max character length of the summary | `300` |
| `post-as-comment` | Post summary as a PR comment | `true` |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](./LICENSE)