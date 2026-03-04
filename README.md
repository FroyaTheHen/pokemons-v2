# Pokemons

This project is structured to be readable and reviewable step by step. Each meaningful change is introduced on a separate, numbered branch and submitted as a pull request against the previous branch — so reviewers can follow the progression of the codebase one focused change at a time.

## Branch & PR Convention

Branches are named with an incrementing number prefix:

```
main
2-<descriptive-name>   → PR into main
3-<descriptive-name>   → PR into 2-<descriptive-name>
4-<descriptive-name>   → PR into 3-<descriptive-name>
...
```

Each PR represents a single, self-contained step. To review the project, go through the pull requests in numerical order — the diff on each PR shows exactly what changed in that step.
