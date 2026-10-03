# Philosophy — the Bushido Ops dojo code

Philosophy is a dedicated page at `#philosophy`, reached from the home navigation. The original three home principle cards now open their corresponding tabs at `#philosophy/order`, `#philosophy/respect` and `#philosophy/honor`.

## Content

| Principle | Practice | Example |
| --- | --- | --- |
| Order | Pause, verify independently, take one clear step at a time. | An urgent account message. |
| Respect | Protect privacy, agree boundaries, welcome beginners. | A friend’s website you want to test. |
| Honor | Be honest about uncertainty, learn from mistakes, help others. | A mistake during practice. |

Each tab contains a short explanation, three habits, a maxim and a fictional scenario. A native disclosure opens the suggested next move. This is an original product code inspired by martial-arts practice; it does not present a historical account of Bushido.

## Interactions

- Tabs support pointer input and arrow-key navigation. Selected principles appear in the URL and work with browser back and forward.
- “Build your dojo code” jumps to `#philosophy/code`, focuses the code heading and places the first checkbox next in keyboard order.
- Three optional habits can be checked independently. A live count and feedback reflect the selection.
- Choices survive navigation between home, Philosophy and training within the open page. They reset on reload; there is no account or durable storage.
- “Start white belt” opens the existing Warm-up. Choosing habits does not award XP and does not gate entry to practice.
- The skip link focuses the main content. The page title identifies Philosophy.

The scene reuses the clean dojo background and the approved 8-bit Ryu-style fighter. Idle movement remains small; the existing complete-body reaction is triggered by interaction. Fonts, palette, borders and icons come from the existing dojo design. Layouts reflow for small screens.

## Files

- `lib/philosophy-content.ts`: shared principle copy and IDs.
- `components/philosophy-page.tsx`: dedicated page and interactions.
- `app/page.tsx`: navigation and shared session state.
- `app/globals.css`: Philosophy layout and responsive styling.

## Further reading

- [FTC: How to Recognize and Avoid Phishing Scams](https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams). Supports the Order example’s independent verification through a known channel.
- [OWASP: Vulnerability Disclosure Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html). Supports the Respect example’s emphasis on authorization, scope and privacy.

The scenarios and Honor copy are written for Bushido Ops. Resource links open in a new tab and are labelled accordingly.
