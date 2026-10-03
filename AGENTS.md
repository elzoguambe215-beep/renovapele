<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the sales page as one route with distinct content sections and a single persistent order action; this prevents repeated offer blocks from competing for attention.
- Store checkout orders in a write-only public Cloud table and never expose buyer details through public reads; visitors can order without accounts while their data stays private.
