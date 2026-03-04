WhatsApp Bot - Button Function Documentation

Function: client.sendButton

Description

Mengirim pesan interaktif dengan button ke chat WhatsApp. Mendukung berbagai tipe button seperti quick reply, URL, copy code, phone call, dan list menu.

Syntax

```javascript
client.sendButton(jid, content, options)
```

Parameters

Parameter Type Description
jid string ID chat tujuan (nomor atau group)
content object/string Konten pesan dan button
options object Opsi tambahan (quoted, dll)

Content Object Structure

Property Type Description
text string Teks utama pesan
footer string Teks footer
title string Judul pesan
subtitle string Subjudul pesan
buttons array Array of button objects
mentions array Array of JIDs yang disebut
contextInfo object Informasi konteks tambahan

Button Object Structure

Property Type Description
buttonName string Teks yang tampil di button
id string ID button (untuk quick reply)
url string URL (untuk button link)
copy_code string Teks yang akan dicopy
phone_number string Nomor telepon (untuk call)
title string Judul list menu
rows array Array of row objects untuk list menu

Row Object Structure (untuk list menu)

Property Type Description
title string Judul row
description string Deskripsi row
id string ID row

---

Contoh Penggunaan

1. Button Biasa (Quick Reply)

```javascript
client.sendButton(m.chat, {
  text: "Pilih menu di bawah ini:",
  footer: "Pilih salah satu opsi",
  buttons: [
    { buttonName: "Menu Utama", id: "menu" },
    { buttonName: "Profile", id: "profile" },
    { buttonName: "Bantuan", id: "help" }
  ]
}, { quoted: m });
```

2. Button URL

```javascript
client.sendButton(m.chat, {
  text: "Kunjungi website kami:",
  footer: "Klik tombol di bawah",
  buttons: [
    { buttonName: "Google", url: "https://google.com" },
    { buttonName: "GitHub", url: "https://github.com" }
  ]
}, { quoted: m });
```

3. Button Copy Code

```javascript
client.sendButton(m.chat, {
  text: "Copy kode di bawah ini:",
  footer: "Klik tombol untuk copy",
  buttons: [
    { buttonName: "Copy Kode", copy_code: "ABC123XYZ" }
  ]
}, { quoted: m });
```

4. Button Call (Telepon)

```javascript
client.sendButton(m.chat, {
  text: "Hubungi kami jika ada kendala:",
  footer: "Klik untuk menelepon",
  buttons: [
    { buttonName: "Call Support", phone_number: "+6281234567890" }
  ]
}, { quoted: m });
```

5. Button List Menu (Single Select)

```javascript
client.sendButton(m.chat, {
  text: "Pilih menu makanan:",
  footer: "Klik untuk melihat pilihan",
  buttons: [
    { 
      buttonName: "Lihat Menu Makanan", 
      title: "Daftar Menu",
      rows: [
        { title: "Nasi Goreng", description: "Nasi goreng spesial", id: "nasi_goreng" },
        { title: "Mie Goreng", description: "Mie goreng pedas", id: "mie_goreng" }
      ]
    }
  ]
}, { quoted: m });
```

6. Button dengan Title dan Subtitle

```javascript
client.sendButton(m.chat, {
  title: "INFORMASI PENTING",
  subtitle: "Update Terbaru",
  text: "Bot telah diupdate ke versi terbaru",
  footer: "Terima kasih telah menggunakan bot kami",
  buttons: [
    { buttonName: "Lihat Changelog", id: "changelog" }
  ]
}, { quoted: m });
```

7. Button dengan Mentions

```javascript
client.sendButton(m.chat, {
  text: `Halo @${m.sender.split('@')[0]}, silahkan pilih menu:`,
  footer: "Menu Utama",
  buttons: [
    { buttonName: "Profile", id: "profile" }
  ],
  mentions: [m.sender]
}, { quoted: m });
```

8. Button dengan External Ad Reply

```javascript
client.sendButton(m.chat, {
  text: "Promo Spesial Bulan Ini!",
  footer: "Klik tombol di bawah",
  buttons: [
    { buttonName: "Beli Sekarang", url: "https://shop.com" }
  ],
  contextInfo: {
    externalAdReply: {
      title: "DISKON 50%",
      body: "Untuk semua produk",
      thumbnailUrl: "https://files.catbox.moe/t3w6mm.png",
      sourceUrl: "https://example.com",
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}, { quoted: m });
```

9. Multiple List Menu

```javascript
client.sendButton(m.chat, {
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

10. Format Singkat (String)

```javascript
client.sendButton(m.chat, "Pesan sederhana dengan tombol", {
  buttons: [
    { buttonName: "OK", id: "ok" },
    { buttonName: "Cancel", id: "cancel" }
  ]
}, { quoted: m });
```

---

Menangani Response Button

```javascript
// Di dalam handler pesan
try {
  if (mek.mtype === 'buttonsResponseMessage') {
    const id = mek.message?.buttonsResponseMessage?.selectedButtonId;
    if (id) {
      mek.text = id;
      mek.body = id;
      mek.message.conversation = id;
    }
  }
  else if (mek.mtype === 'listResponseMessage') {
    const id = mek.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
    if (id) {
      mek.text = id;
      mek.body = id;
      mek.message.conversation = id;
    }
  }
  else if (mek.mtype === 'interactiveResponseMessage') {
    const raw = mek.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.id) {
        mek.text = data.id;
        mek.body = data.id;
        mek.message.conversation = data.id;
      }
    }
  }
  else if (mek.mtype === 'templateButtonReplyMessage') {
    const id = mek.message?.templateButtonReplyMessage?.selectedId;
    if (id) {
      mek.text = id;
      mek.body = id;
      mek.message.conversation = id;
    }
  }
} catch (e) {}
```

---

Notes

· Button maksimal 3 buah untuk tipe quick reply
· Untuk list menu, bisa memiliki banyak rows
· thumbnailUrl pada externalAdReply harus berupa URL gambar yang valid
· mentions otomatis ditambahkan ke contextInfo
