# Site walk fixes: reports for Mark (24 Nov 2026)

Checked on a local copy of the site in preview mode, at computer width and at 390 wide. Not yet pushed, so not yet on the preview address. Things that need a real account, Paddle or Vercel are listed at the end.

## 1. Know yourself buttons

The full list is in `plans/know-yourself-buttons.md`: every picture, its four feelings, and the four "what specifically?" choices under each feeling.

Test result: all 128 feelings across the 32 pictures were pressed in the real page. Each one opened its own four choices under its own label, and no other feeling's. No failures. Every picture has exactly four feelings and every feeling exactly four choices.

## 2. Sizes after the fixes

Sizes are computer / phone, in pixels.

| Page | Heading | Reading | Buttons | Labels |
|---|---|---|---|---|
| Chat | top-left label only | messages 26 / 20, yours 18 / 16 | 12.5 / 11.5 | 12 / 11 |
| Know yourself (all screens) | 72 / 38 | 20 / 17, questions and messages 26 / 20 | 12.5 / 11.5 | 12 / 11 |
| Goals (five pages) | 72 / 38 | 20 / 18 | 11.5 small buttons | 11 |
| Personal meditations | top-left label only | 20 / 18, messages 26 / 20 | 11.5 to 12 | 11 |
| Meditations | 72 / 38 | 20 / 17, card sentence 15 | 12.5 / 11.5 | 11 |
| Education | 72 / 38 | 20 / 17 | 12.5 / 11.5 | 12 / 11 |
| Give a gift | 72 / 38 | 20 / 17 | 12.5 / 11.5 | 12 / 11 |
| Membership | 72 / 38 | 20 / 17 | 12.5 / 11.5 | 12 / 11 |
| Account & earnings | 72 / 38 | 20 / 17 | 12.5 / 11.5 | 12 / 11 |
| Help & FAQ | 72 / 38 | 20 / 17, messages 26 / 20 | 12.5 / 11.5 | 12 / 11 |
| Private & secure, Terms, Payment terms | 72 / 38 | unchanged | unchanged | unchanged |
| Urgent support | its sentence heading, 40 to 56 / 26 to 32 | 21 / 16 | none | 12 |
| Front page | hook 41 / about 29 | 20 / about 17 | 12.5 / about 12 | 12 / 10.5 |
| Gift page a friend lands on | sentence 23 on the card / 29 | 15.5 / 18 | 12.5 / 13 | 11 |

Not yet one size:
- Goals and Personal meditations keep their own small buttons (11.5) and labels (11) from the signed-off Goals design.
- Meditation card sentences are 15.
- The legal pages were only given the heading and the wording changes.
- Education course names are a second heading at 56 / 34. Give a gift's "Share your link" is 54 / 38.

## 3. Answers to the five questions

1. **What turns speech into text when the microphone is tapped? Is it Gemini?** No. It is the browser's own speech-to-text (Chrome and Safari have it built in; Firefox does not, so the microphone is hidden there). Sussuri never receives the audio. Gemini was only used by the waveform, which is now hidden, so the Gemini row came off Private & secure.
2. **What runs the text chat today?** Anthropic's Claude Sonnet 4.6, through `api/chat.js`. Goals, Help and the Know yourself chat and profile use the same route.
3. **What does "Become a member" do for someone on the free month with a card on file?** It only opens the Join page. There it starts a brand-new checkout, the same as "Start free month". It does not use the card on file, end the free month early or charge now. The existing subscription would charge by itself when the free month ends, so going through it again would most likely start a second subscription.
4. **What ends the Know yourself chat today?** A message count: 20 messages from the person. Nothing else.
5. **Why did the profile's personal writing not arrive?** The twelve lines were asked for in two halves with a length cap. With a real chat behind it the reply ran longer than the cap, was cut off mid-sentence and could not be read, so the stand-in text with "[personal]" stayed on the page. It is now asked for in four smaller parts with one retry, gives up after 58 seconds, and on failure shows the score lines with a "Try again" link. In two test runs all twelve lines arrived in about 20 seconds. The loading line hanging forever was not reproduced.

## 4. Checked at 390 wide

Every page below has no sideways scroll at 390.

| Page | Changed to make it fit |
|---|---|
| Front page | Hook and line sizes scale with the width; the box keeps room for the longest hook; the bottom row stacks with a full-width button |
| Gift page a friend lands on | White top part, then the front page; claim bar fixed at the bottom |
| Chat | The two bars under the typing box stack |
| Know yourself | Profile lines stack (name and score on top, bar underneath); end-of-chat box stacks; question answers wrap |
| Goals: Talk it through | Nothing beyond the new typing box |
| Goals: Plan | Bigger tap area on the tick boxes |
| Goals: Schedule | Bigger tap area on the tick boxes |
| Goals: Today | Day boxes show the day, the number and a short count ("4/5"); bigger tap areas on ticks, week links and Play |
| Goals: Review | Nothing |
| Personal meditations | Nothing beyond the new typing box |
| Meditations | The label sits on its own line above the sentence |
| Education | Week rows stack: week number and status on top, title underneath |
| Give a gift | Boxes go under the heading; controls go under the card; name and photo side by side |
| Membership | Rows stack; window and step buttons go full width |
| Account & earnings | Rows wrap; links are thumb-sized |
| Help & FAQ | Nothing beyond the new typing box and heading |
| Private & secure, Terms, Payment terms | Nothing |
| Urgent support | Nothing beyond the arrows |
| Settings, Welcome, Join, Sign-up, Sign in, You're in | Nothing (not part of this job, checked for overflow only) |

Not checked: the typing box against a real phone keyboard. It scrolls itself into view when tapped, but that needs a real phone to confirm.

## Not tested for real

- Membership: Cancel membership and Close my account only change the page. There is no Paddle account behind them. Plan, card and "2 members / $20" are sample values.
- Nothing answers at sussuri.com/j/name yet, and nothing links a friend to the member who shared.
- The gift link's preview picture and the /g/ address need Vercel; they were only run locally.
- Know yourself's account copy of the profile (for a second device) was not tested with a real sign-in.
- Goals, Personal meditations and Help chats use a stand-in Sussuri in preview mode.
