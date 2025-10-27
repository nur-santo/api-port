## API-PORT
---

# Supabase Edge Function - Image AI Proxy API

Proxy API berbasis **Supabase Edge Function** yang menghubungkan aplikasi kamu ke berbagai layanan AI image seperti **Picsart** dan **AILab**, untuk melakukan manipulasi gambar (remove background, filter, hair style, dll.) dengan aman melalui satu endpoint.

---

## Endpoint

```
POST https://<YOUR_SUPABASE_PROJECT>.functions.supabase.co/ai-proxy
```

> 🔹 Ganti `<YOUR_SUPABASE_PROJECT>` dengan project URL kamu.
> Contoh:
> `https://myproject.supabase.co/functions/v1/ai-proxy`

---

## Supported Features

| Fitur      | Deskripsi                                 | Provider |
| ---------- | ----------------------------------------- | -------- |
| `removebg` | Menghapus background gambar               | Picsart  |
| `filter`   | Menambahkan efek atau filter ke gambar    | Picsart  |
| `cartoon`  | Mengubah gambar menjadi gaya kartun       | Picsart  |
| `upscale`  | Meningkatkan resolusi gambar              | Picsart  |
| `hair`     | Mengubah gaya rambut menggunakan AI       | AILab    |
| `skin`     | Memperhalus dan mencerahkan wajah         | AILab    |
| `makeup`   | Menambahkan efek makeup otomatis          | AILab    |
| `light`    | Menyesuaikan warna dan pencahayaan gambar | AILab    |

---

## Request Format

**Method:** `POST`
**Content-Type:** `application/json`

### Body Parameters

| Field     | Tipe     | Wajib | Deskripsi                                             |
| --------- | -------- | ----- | ----------------------------------------------------- |
| `fitur`   | `string` | ✅     | Nama fitur yang ingin digunakan (lihat tabel di atas) |
| `img_url` | `string` | ✅     | URL publik gambar yang akan diproses                  |
| `data`    | `object` | ❌     | Data tambahan (bergantung pada fitur)                 |

---

## Contoh Input Request

### 1. Remove Background

```json
{
  "fitur": "removebg",
  "img_url": "https://example.com/photo.jpg"
}
```

---

### 2. Filter (Efek)

```json
{
  "fitur": "filter",
  "img_url": "https://example.com/photo.jpg",
  "data": {
    "jenis": "fx_flare"
  }
}
```

---

### 3. Hair Style

```json
{
  "fitur": "hair",
  "img_url": "https://example.com/photo.jpg",
  "data": {
    "style": "Long hair"
  }
}
```

Daftar style yang tersedia:

| Style Name           | Code |
| -------------------- | ---- |
| Bangs                | 101  |
| Long hair            | 201  |
| Bangs with long hair | 301  |
| Medium hair increase | 401  |
| Light hair increase  | 402  |
| Heavy hair increase  | 403  |
| Light curling        | 502  |
| Heavy curling        | 503  |
| Short hair           | 603  |
| Blonde               | 801  |
| Straight hair        | 901  |
| Oil-free hair        | 1001 |
| Hairline fill        | 1101 |
| Smooth hair          | 1201 |
| Fill hair gap        | 1301 |

---

### 4. Makeup

```json
{
  "fitur": "makeup",
  "img_url": "https://example.com/photo.jpg"
}
```

---

### 5. Lighting Enhancement

```json
{
  "fitur": "light",
  "img_url": "https://example.com/photo.jpg"
}
```

---

## Contoh Response (Berhasil)

Semua fitur akan mengembalikan struktur JSON yang sama:

```json
{
  "url": "https://your-supabase-url/storage/v1/object/public/image/hair-201-1730000000000.png"
}
```

> `url` = URL publik hasil gambar yang telah diproses dan di-upload ke **Supabase Storage**.

---

## Contoh Response (Gagal)

```json
{
  "error": "Invalid hairstyle: Shorter than expected"
}
```

Atau:

```json
{
  "error": "Missing parameters"
}
```

---

## Environment Variables

Tambahkan variabel berikut di **Supabase Edge Function Settings**:

| Key                         | Deskripsi                                                              |
| --------------------------- | ---------------------------------------------------------------------- |
| `SUPABASE_URL`              | URL Project Supabase                                              |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci service role Supabase                                            |
| `PICSART_API_KEY`           | API Key dari [Picsart Developer Portal](https://developers.picsart.io) |
| `AILAB_API_KEY`             | API Key dari [AILab API](https://www.ailabapi.com/)                    |

---

## Storage

Hasil gambar yang diproses akan disimpan otomatis di bucket:

```
image/
```

Pastikan kamu sudah membuat bucket publik bernama `image` di **Supabase Storage**, dan mengaktifkan public read access.

---

## Quick Test (cURL)

```bash
curl -X POST "https://<YOUR_PROJECT>.functions.supabase.co/ai-proxy" \
  -H "Content-Type: application/json" \
  -d '{
    "fitur": "removebg",
    "img_url": "https://example.com/photo.jpg"
  }'
```

Output:

```json
{
  "url": "https://your-supabase-url/storage/v1/object/public/image/removebg-1730000000000.png"
}
```

---

## Tech Stack

* Deno Edge Runtime
* Supabase Functions
* Supabase Storage
* AILab & Picsart API


