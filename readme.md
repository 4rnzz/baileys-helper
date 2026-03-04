@rnzz/helper

WhatsApp button helper for Baileys. Memudahkan pengiriman pesan button, list, dan interactive message di WhatsApp bot.

Fitur

· Kirim berbagai tipe button (quick reply, url, copy code, phone call)
· Kirim list menu (single select)
· Dukungan externalAdReply
· Mentions otomatis
· ContextInfo kustom
· Handler response button otomatis

Instalasi

```bash
npm install @rnzz/helper
```

Persyaratan

· Node.js >= 20
· Baileys ^7.0.0-rc.9

Penggunaan Dasar

```javascript
const { ButtonCreate, ButtonResponse } = require('@rnzz/helper');
const makeWASocket = require('baileys');

const sock = makeWASocket({ ... });

// Inisialisasi button helper
await ButtonCreate(sock);

// Kirim pesan dengan button
await sock.sendButton('6281234567890@s.whatsapp.net', {
  text: "Pilih menu:",
  footer: "Footer pesan",
  buttons: [
    { buttonName: "Menu 1", id: "menu1" },
    { buttonName: "Menu 2", id: "menu2" },
    { buttonName: "Google", url: "https://google.com" }
  ]
});

// Handle response button
sock.ev.on('messages.upsert', ({ messages }) => {
  const m = messages[0];
  ButtonResponse(m);
  
  if (m.text === 'menu1') {
    sock.sendMessage(m.key.remoteJid, { text: 'Kamu memilih Menu 1' });
  }
});
```

Tipe Button

1. Quick Reply Button

```javascript
{
  buttonName: "Tekan Saya",
  id: "tekan_saya"
}
```

2. URL Button

```javascript
{
  buttonName: "Kunjungi Website",
  url: "https://example.com"
}
```

3. Copy Code Button

```javascript
{
  buttonName: "Copy Kode",
  copy_code: "ABC123XYZ"
}
```

4. Phone Call Button

```javascript
{
  buttonName: "Hubungi CS",
  phone_number: "+6281234567890"
}
```

5. List Menu (Single Select)

```javascript
{
  buttonName: "Pilih Menu",
  title: "Daftar Menu",
  rows: [
    { title: "Nasi Goreng", description: "Nasi goreng spesial", id: "nasi_goreng" },
    { title: "Mie Goreng", description: "Mie goreng pedas", id: "mie_goreng" }
  ]
}
```

Contoh Lengkap

Button dengan Title dan Subtitle

```javascript
await sock.sendButton(m.chat, {
  title: "INFORMASI PENTING",
  subtitle: "Update Terbaru",
  text: "Bot telah diupdate ke versi terbaru",
  footer: "Terima kasih telah menggunakan bot kami",
  buttons: [
    { buttonName: "Lihat Changelog", id: "changelog" }
  ]
}, { quoted: m });
```

Button dengan Mentions

```javascript
await sock.sendButton(m.chat, {
  text: `Halo @${m.sender.split('@')[0]}, silahkan pilih menu:`,
  footer: "Menu Utama",
  buttons: [
    { buttonName: "Profile", id: "profile" }
  ],
  mentions: [m.sender]
}, { quoted: m });
```

Button dengan External Ad Reply

```javascript
await sock.sendButton(m.chat, {
  text: "Promo Spesial Bulan Ini!",
  footer: "Klik tombol di bawah",
  buttons: [
    { buttonName: "Beli Sekarang", url: "https://shop.com" }
  ],
  contextInfo: {
    externalAdReply: {
      title: "DISKON 50%",
      body: "Untuk semua produk",
      thumbnailUrl: "https://example.com/image.jpg",
      sourceUrl: "https://example.com",
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}, { quoted: m });
```

Multiple List Menu

```javascript
await sock.sendButton(m.chat, {
  text: "Pilih kategori:",
  buttons: [
    { 
      buttonName: "Kategori Makanan", 
      title: "Menu Makanan",
      rows: [
        { title: "Makanan Berat", description: "Nasi, mie, dll", id: "makanan_berat" }
      ]
    },
    { 
      buttonName: "Kategori Minuman", 
      title: "Menu Minuman",
      rows: [
        { title: "Minuman Panas", description: "Kopi, teh", id: "minuman_panas" }
      ]
    }
  ]
}, { quoted: m });
```

Format Singkat (String)

```javascript
await sock.sendButton(m.chat, "Pesan sederhana dengan tombol", {
  buttons: [
    { buttonName: "OK", id: "ok" },
    { buttonName: "Cancel", id: "cancel" }
  ]
}, { quoted: m });
```


API Reference

ButtonCreate(client, options)

Inisialisasi button helper ke client Baileys.

Parameter Tipe Keterangan
client object Instance Baileys socket
options object Opsi kustomisasi (opsional)

ButtonResponse(message)

Handle response button dan menambahkan property text ke message.

Parameter Tipe Keterangan
message object Message object dari Baileys

client.sendButton(jid, content, options)

Mengirim pesan button.

Parameter Tipe Keterangan
jid string ID chat tujuan
content object/string Konten pesan dan button
options object Opsi tambahan (quoted, dll)

Lisensi

MIT

Kontribusi

Silakan buat issue atau pull request di GitHub Repository.
