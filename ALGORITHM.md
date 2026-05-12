# Poker Game Algorithm Documentation

## Table of Contents

1. [Overview](#overview)
2. [Deck Composition](#deck-composition)
3. [Player & Device System](#player--device-system)
4. [Game Flow](#game-flow)
5. [Turn Mechanics](#turn-mechanics)
6. [Discard Pile Rotation](#discard-pile-rotation)
7. [Card Discard Validation](#card-discard-validation)
8. [Show Card & Winner Decision](#show-card--winner-decision)
9. [Game Over (ဒေါင်းပြီ) Flow](#game-over-ဒေါင်းပြီ-flow)
10. [Wrong Counter](#wrong-counter)
11. [AI Player Algorithm](#ai-player-algorithm)
12. [Multiplayer Architecture](#multiplayer-architecture)
13. [Socket Events Reference](#socket-events-reference)

---

## Overview

A real-time 4-player Myanmar card game (ဖဲဂိမ်း) built with Node.js + Socket.IO on the server and vanilla JavaScript on the client. All game state is shared across every connected device via socket broadcasts — every client maintains an identical copy of the game state.

- **Max players:** 4 (one device per slot)
- **Server:** `https://poker-iyrv.onrender.com/`
- **Tech stack:** Express, Socket.IO, jQuery, vanilla JS

---

## Deck Composition

The game uses a double deck plus jokers:

| Variable | Cards | Count |
|----------|-------|-------|
| `a1`, `a2` | `a01`–`a13` | 13 × 2 = 26 |
| `b1`, `b2` | `b01`–`b13` | 13 × 2 = 26 |
| `c1`, `c2` | `c01`–`c13` | 13 × 2 = 26 |
| `d1`, `d2` | `d01`–`d13` | 13 × 2 = 26 |
| `joker1`, `joker2` | `j1`, `j2` | 2 × 2 = 4 |
| **Total** | | **108 cards** |

**Card naming convention:** `{suit}{number}`
- Suits: `a`, `b`, `c`, `d`
- Numbers: `01` (Ace) through `13` (King)
- Jokers: `j1`, `j2`

The full deck is stored in the `package` array and treated as a stack (cards are dealt with `package.pop()`).

---

## Player & Device System

### Slot Assignment

When a client connects, the server assigns it to the first available slot (1–4):

```
deviceSlots = [null, null, null, null]
```

- **Device ID** = first 5 characters of the socket ID (`socket.id.slice(0, 5)`)
- Slot index → Player number (index 0 = Player 1, etc.)
- If all 4 slots are taken, the server emits `device-full` and disconnects the client

### Panel Ownership (CSS-based)

After `player-assigned` is received, the client marks its own panel with CSS classes:

| Class | Panel element | Effect |
|-------|--------------|--------|
| `panel-self` | `#panel-N` | Shows the hand cards area |
| `action-self` | `#action-N` | Shows all action buttons |
| `voice-self` | `#pv-area-N` | Shows voice control buttons |

All other players' action buttons, hand cards, and voice controls are hidden by CSS rules — players can only see and interact with their own panel.

---

## Game Flow

```
1. စမယ် (Shuffle)
       |
       v
2. မွှေမယ် (Re-shuffle, up to 5 times)
       |
       v
3. ဝေမယ် (Deal) — called 13 times
   Each call: deal 1 card to each of the 4 players
   After 13 calls: every player holds 13 cards
       |
       v
4. အပေါ်ဖဲလှန်မယ် (Flip top card)
   One card is revealed face-up as the "show card"
       |
       v
5. Gameplay loop
   Each player on their own device:
     a. Take from opponent's discard (စားမယ်)  OR
        Draw from deck (ဆွဲမယ်)
     b. Discard a card from hand (ပစ်မယ်)
     c. Optionally: self-arrange hand (စီမယ်)
       |
       v
6. ဒေါင်းပြီ (Game Over)
   Any player can call it; requires all others to agree
       |
       v
7. Reset — all state cleared, new game begins
```

---

## Turn Mechanics

### Drawing a Card

**ဆွဲမယ် (Draw from deck)**
- Emits `swalMaluser{N}`
- `user{N}.push(package.pop())` — top of deck goes to player's hand
- Guard: if hand already has more than 13 cards, the draw is blocked

**စားမယ် (Take from opponent's discard)**
- Emits `sarMaluser{N}`
- On the **very first turn** (`initial === true` and `showCard.length === 1`):
  - Takes the face-up show card instead of a discard pile card
  - Sets `initial = false`
- On subsequent turns:
  - Takes the top card from the previous player's discard pile (see rotation table below)
  - The taken card is visually marked as `.card-taken` (dimmed) in the discard pile display

### Discarding a Card

1. Player clicks a card in their hand → `readyToPyit(x)` is called
2. A "ပစ်မယ်" (discard) and "မပစ်ဘူး" (cancel) button pair appears
3. Clicking "ပစ်မယ်" → `pyitMaluser{N}(card)` → emits `pyitMaluser{N}`
4. Server/all clients:
   - Remove the card from `user{N}`
   - Add it to `user{N}_remove`
   - Re-render the player's hand and discard pile

---

## Discard Pile Rotation

Discards flow in a circular clockwise direction. Each player can only take from the player immediately before them:

```
Player 1 discards --> available to Player 2
Player 2 discards --> available to Player 3
Player 3 discards --> available to Player 4
Player 4 discards --> available to Player 1
```

In code:

| Player (N) | Draws from discard | Variable |
|------------|--------------------|----------|
| 1 | Player 4's pile | `user4_remove` |
| 2 | Player 1's pile | `user1_remove` |
| 3 | Player 2's pile | `user2_remove` |
| 4 | Player 3's pile | `user3_remove` |

The eaten cards (`sarPhel`) are separately tracked per player in `user{N}_sarPhel` for validation purposes.

---

## Card Discard Validation

### `checkToRemove(sarPhel, htwetPhel, cardNumber)`

Before a discard is accepted, the game checks whether the card being discarded is "protected" — meaning the next player has already eaten (taken) that card number but has not yet discarded it themselves.

**Logic:**

```
sarPhelMi   = cardNumber exists in next player's sarPhel (eaten cards)
htwetPhelShi = cardNumber exists in next player's remove (already discarded)

blocked = sarPhelMi AND NOT htwetPhelShi
```

**Per-player protection check:**

| Player discarding | Protected by | sarPhel check | remove check |
|-------------------|-------------|---------------|--------------|
| 1 | Player 2 | `user2_sarPhel` | `user2_remove` |
| 2 | Player 3 | `user3_sarPhel` | `user3_remove` |
| 3 | Player 4 | `user4_sarPhel` | `user4_remove` |
| 4 | Player 1 | `user1_sarPhel` | `user1_remove` |

If blocked, the discard is silently rejected (returns `false`).

---

## Show Card & Winner Decision

### Flip Phase

`showFirstCard()` pops the top card from `package` and places it face-up as `showCard[0]`. Its suit prefix becomes `showCardType` (e.g., `'a'` for `a07`).

Each player's matching-suit cards are collected:

```
showCarduser{N} = user{N}.filter(card => card.startsWith(showCardType))
```

### `autoDecide()` — Winner Algorithm

Called when "သပ် အနိုင်ဆုံးဖဲပြမယ်" is clicked. Runs the following rules in order:

**Rule 1 — Exact match**
- Any player holding the exact same card as `showCard[0]` wins immediately
- Multiple players can tie on this rule

**Rule 2 — Ace priority**
- If no exact match, players holding the Ace of the matching suit (`showCardType + '01'`) are preferred
- If no Ace holders exist, all players with any matching-suit cards are candidates

**Rule 3-5 — Hand comparison**
- Among candidates, compare full hands sorted highest-first
- Card values: Joker = 1, 2–13 = face value, Ace (01) = 14
- Compare position by position; first difference decides the winner
- Equal hands → both are winners (tie)

**Best card display per player:**

Priority: exact showCard match > Ace of suit > highest card in hand

**Result display:**
- Winners shown with gold "WIN" label
- Losers shown with red "LOSE" label
- Each has a close (×) button to dismiss

---

## Game Over (ဒေါင်းပြီ) Flow

Any player can declare game over at any time using the "ဒေါင်းပြီ" button in their action panel.

```
Player clicks "ဒေါင်းပြီ"
         |
         v
emit: dawngPi-request { player: N }
         |
         v (server)
dawngPiReq = { requester: sid, agreed: [requester_sid] }
broadcast: dawngPi-request { player, agreedCount, totalCount }
         |
         +---> Requester's screen: overlay opens, both buttons hidden
         |
         +---> Other players' screens: overlay opens with:
                 - Requester name + Device ID
                 - Requester's card hand displayed
                 - "သဘောတူမည်" (Agree) button  [green]
                 - "သဘောမတူပါ" (Disagree) button [red]

If AGREE clicked:
    emit: dawngPi-agree
    server: adds sid to agreed list
    broadcast: dawngPi-agreed { agreedCount, totalCount }
    If agreedCount >= connected players:
        finishDawngPi() --> broadcast: dawngPi --> all clients RESET

If DISAGREE clicked:
    emit: dawngPi-disagree
    overlay closes immediately (no alert) on disagreer's screen
    server: cancels dawngPiReq
    broadcast: dawngPi-disagreed { player, deviceId }
    Other players: overlay closes + alert shows who disagreed

If requester DISCONNECTS during voting:
    server: dawngPiReq = null
    broadcast: dawngPi-cancelled --> all overlays close
```

### Reset on Game Over

When `dawngPi` event fires, all state is wiped:

- `package` rebuilt from all 8 suit arrays + jokers
- `user1–4`, `user1–4_remove`, `user1–4_sarPhel`, `user1–4_winnerCard` → `[]`
- `showCard`, `showCardType`, `showCarduser1–4` → cleared
- `initial` → `true`
- All DOM card areas cleared
- Dynamically added action buttons removed
- Header buttons reset to initial state (only "စမယ်" visible)

---

## Wrong Counter

A manual penalty tracking system, independent of card logic.

- Each player has a wrong count (`wrongCounts[1..4]`)
- `+` button → `addWrong(player, +1)`
- `−` button → `addWrong(player, -1)`, minimum 0
- **Total penalty** = `wrongCount × betAmount`
- `betAmount` is configurable (default 100, step 50)
- Updates live as bet amount changes via `updateAllTotals()`

This is local-only (not synced via socket) — intended for the game host to track.

---

## AI Player Algorithm

Unoccupied slots (no device connected) can be played automatically with "AI ကစားမည်".

### Card Scoring

```
aiCardScore(card):
  joker (j1/j2) --> 1   (lowest, discard first)
  02-13          --> 2-13 (face value)
  01 (Ace)       --> 14  (highest)
```

### Turn Decision

```
1. Look at top of opponent's discard pile (topDiscard)
2. Find worst card in own hand (aiWorstCard = lowest score)
3. If topDiscard score > worst card score:
       --> sarMal (take the discard)
   Else if deck has cards:
       --> swalMal (draw from deck)
   Else:
       --> skip turn

4. Pre-compute which card to discard from (hand + drawn card)
       --> discard the lowest-scoring card (aiWorstCard)
5. Emit draw action, wait 700ms, emit discard action
```

### Sequencing

`aiPlayAll()` plays all unconnected players in order (1→4), with 300 ms between each player's turn, and 700 ms between each player's draw and discard (to allow socket round-trips to update shared state).

---

## Multiplayer Architecture

### State Model

All game state (`package`, `user1–4`, discard piles, etc.) lives identically on **every client**. The server acts as a relay with minimal state (slot registry, dawngPi agreement tracking). When any client mutates state, it emits an event; the server broadcasts it; all clients — including the sender — apply the mutation in their `socket.on(...)` handlers.

```
Client A                Server              Client B / C / D
    |                     |                       |
    |-- emit('action') -->|                       |
    |                     |-- broadcast('action'->|
    |<----- ('action') ---|                       |
    | apply mutation      |               apply mutation
```

This means state changes always go through the server loop, ensuring all clients stay in sync.

### Connection / Disconnection

On disconnect, the server:
1. Frees the device slot
2. Broadcasts updated `device-slots`
3. If the disconnected player was the `dawngPi` requester, cancels the request and broadcasts `dawngPi-cancelled`
4. Removes them from any active voice channel

---

## Socket Events Reference

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `saMal` | `package[]` | Shuffle and share deck state |
| `wayMal` | — | Deal one card to each player |
| `showFirstCard` | — | Flip top card face-up |
| `sarMaluser{N}` | — | Player N takes from discard |
| `swalMaluser{N}` | — | Player N draws from deck |
| `pyitMaluser{N}` | `cardSrc` (string) | Player N discards a card |
| `autoDecide` | — | Trigger winner calculation |
| `firstCardLoseruser{N}` | — | Clear player N's winner area |
| `dawngPi-request` | `{ player }` | Declare game over |
| `dawngPi-agree` | — | Agree to game over |
| `dawngPi-disagree` | — | Reject game over |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `player-assigned` | `{ player, deviceId }` | Slot number assigned to this device |
| `device-slots` | `[slot, ...]` | Current slot occupancy for all 4 slots |
| `device-full` | — | All slots taken; connection rejected |
| `saMal` | `package[]` | Shuffled deck broadcast to all |
| `wayMal` | — | Deal trigger broadcast to all |
| `showFirstCard` | — | Flip trigger broadcast to all |
| `sarMaluser{N}` | — | Take-from-discard broadcast |
| `swalMaluser{N}` | — | Draw-from-deck broadcast |
| `pyitMaluser{N}` | `cardSrc` | Discard broadcast |
| `autoDecide` | — | Winner calculation trigger |
| `firstCardLoseruser{N}` | — | Clear winner area broadcast |
| `dawngPi-request` | `{ player, agreedCount, totalCount }` | Game over request broadcast |
| `dawngPi-agreed` | `{ sid, agreedCount, totalCount }` | Someone agreed; updated count |
| `dawngPi-cancelled` | — | Request cancelled (requester left) |
| `dawngPi-disagreed` | `{ player, deviceId }` | Someone disagreed; request cancelled |
| `dawngPi` | — | All agreed; reset game state |
