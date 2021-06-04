sccache for GitHub Actions - speedup your Rust project build
============================================================

This repository provides GitHub Actions which enables projects to cache the compiled ouotput using
[sccache](https://github.com/mozilla/sccache).

Usage
-----

```yaml
- name: Configure sccache
  uses: visvirial/sccache-action@v1
  with:
    # Optional
    cache-key: sccache-ubuntu-latest
    # Optional
    release-name: latest
    # Optional
    arch: x86_64-unknown-linux-musl
```

- The `release-name` parameter is the version name listed in [sccache's release page](https://github.com/mozilla/sccache/releases).
- The `arch` parameter is the string included in the binary release `.tar.gz`. For ubuntu, use "x86\_64-unknown-linux-musl".

