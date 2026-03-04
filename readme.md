# @rnzz/helper

[![npm version](https://img.shields.io/npm/v/@rnzz/helper.svg)](https://www.npmjs.com/package/@rnzz/helper)  
[![npm downloads](https://img.shields.io/npm/dm/@rnzz/helper.svg)](https://www.npmjs.com/package/@rnzz/helper)  
[![License](https://img.shields.io/npm/l/@rnzz/helper.svg)](LICENSE)

A lightweight helper for sending WhatsApp interactive messages using Baileys.  
Built to simplify button, list, and interactive message handling for WhatsApp bots.

---

## Overview

`@rnzz/helper` extends the Baileys socket with a convenient `sendButton` method and provides automatic parsing of button responses. It helps reduce boilerplate and keeps your bot handler clean and consistent.

---

## Features

| Feature | Description |
|--------|-------------|
| Multiple button support | Quick reply, URL, copy code, and phone call |
| List menu support | Single-select interactive lists |
| External ad reply | Built-in rich preview support |
| Automatic mentions | Mention parsing handled automatically |
| Custom contextInfo | Full control over message context |
| Response normalization | Button replies mapped into `m.text` |

---

## Requirements

| Dependency | Version |
|-----------|---------|
| Node.js | >= 20 |
| Baileys | ^7.0.0-rc.9 |

---

## Installation

Install the helper:

```bash
npm install @rnzz/helper
```

Install Baileys (if not installed):

```bash
npm install baileys
```

---

## Quick Start

### Initialization

```javascript
const { ButtonCreate } = require('@rnzz/helper')
const makeWASocket = require('baileys')

const client = makeWASocket({})

ButtonCreate(client)
```

---

### Handling Button Responses (Recommended)

Place `ButtonResponse` after your message serialization (`smsg`) and before your main handler.

```javascript
const { ButtonResponse } = require('@rnzz/helper')

sock.ev.on('messages.upsert', async (chatUpdate) => {
  const mek = chatUpdate.messages[0]
  if (!mek.message) return

  const m = smsg(client, mek, {})

  ButtonResponse(m)

  require('./XEoms')(client, m, chatUpdate)
})
```

This ensures all button and list replies are normalized into `m.text`.

---

## Usage Examples

### Basic Menu Button

```javascript
client.sendButton('6281234567890@s.whatsapp.net', {
  text: 'Please choose a menu below',
  footer: 'Bot Menu',
  buttons: [
    { buttonName: 'Main Menu', id: 'menu' },
    { buttonName: 'Owner', id: 'owner' },
    { buttonName: 'Website', url: 'https://example.com' }
  ]
})
```

---

### Information Message

```javascript
client.sendButton(m.chat, {
  title: 'BOT INFORMATION',
  subtitle: 'System Update',
  text: 'The bot is running normally and ready to use.',
  footer: 'Bot Notification',
  buttons: [
    { buttonName: 'Check Status', id: 'status' }
  ]
}, { quoted: m })
```

---

### Menu with Mention

```javascript
client.sendButton(m.chat, {
  text: `Hello @${m.sender.split('@')[0]}, select the feature you want to use.`,
  footer: 'Main Menu',
  buttons: [
    { buttonName: 'Profile', id: 'profile' }
  ],
  mentions: [m.sender]
}, { quoted: m })
```

---

### Promotional Message

```javascript
client.sendButton(m.chat, {
  text: 'Special promotion available this week.',
  footer: 'Limited Offer',
  buttons: [
    { buttonName: 'Order Now', url: 'https://shop.com' }
  ],
  contextInfo: {
    externalAdReply: {
      title: 'WEEKLY PROMO',
      body: 'Limited time discount',
      thumbnailUrl: 'https://example.com/image.jpg',
      sourceUrl: 'https://example.com',
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}, { quoted: m })
```

---

### Category List Menu

```javascript
client.sendButton(m.chat, {
  text: 'Select a category below',
  buttons: [
    {
      buttonName: 'Food Menu',
      title: 'Food Category',
      rows: [
        { title: 'Main Course', description: 'Rice, noodles, etc.', id: 'main_course' }
      ]
    },
    {
      buttonName: 'Drink Menu',
      title: 'Drink Category',
      rows: [
        { title: 'Hot Drinks', description: 'Coffee, tea', id: 'hot_drinks' }
      ]
    }
  ]
}, { quoted: m })
```

---

### Short Format

```javascript
client.sendButton(
  m.chat,
  'Quick action menu',
  {
    buttons: [
      { buttonName: 'OK', id: 'ok' },
      { buttonName: 'Cancel', id: 'cancel' }
    ]
  },
  { quoted: m }
)
```

---

## API Reference

### ButtonCreate(client, options)

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| client | object | Yes | Baileys socket instance |
| options | object | No | Custom configuration |

---

### ButtonResponse(message)

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| message | object | Yes | Baileys message object |

---

### client.sendButton(jid, content, options)

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| jid | string | Yes | Target chat ID |
| content | object or string | Yes | Message content |
| options | object | No | Additional Baileys options |

---

## License

MIT

---

## Contributing

Contributions are welcome.  
Please open an issue or submit a pull request on the repository.
