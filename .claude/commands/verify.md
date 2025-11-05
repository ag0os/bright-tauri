Perform a comprehensive Tauri build and test:

1. Run frontend tests: `npm run test:run`
2. Run Rust tests: `cd src-tauri && cargo test`
3. Check Rust formatting: `cd src-tauri && cargo fmt --check`
4. Run Clippy for lints: `cd src-tauri && cargo clippy`
5. Build dev: `npm run tauri dev` (verify it launches)
6. Build production: `npm run tauri build`
7. Report any errors found and suggest fixes

Focus on:
- IPC communication correctness
- Platform-specific issues
- Security configurations
- Memory safety in Rust code
