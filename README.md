# 🛍️ HAN BUTİK - Akıllı E-Ticaret ve Sadakat Sistemi

> **Yönetim Bilişim Sistemleri (YBS)** kapsamındaki proje çalışmaları dahilinde geliştirilmiş; oyunlaştırma (gamification) ve karar destek mekanizmalarını içeren modern bir e-ticaret platformu.

![Project Status](https://img.shields.io/badge/Status-Geliştirme%20Aşamasında-orange)
![Tech Stack](https://img.shields.io/badge/Stack-PERN%20(Postgres-Express-React-Node)-blue)

## 📖 Proje Hakkında

Han Butik, standart bir alışveriş deneyimini **müşteri sadakat programı** ve **interaktif pazarlık sistemi** ile birleştiren full-stack bir web uygulamasıdır. Müşteriler harcama yaptıkça seviye atlar (Demir -> Bronz -> Gümüş -> Altın) ve seviyelerine göre özel ayrıcalıklar kazanırlar.

Bu proje, hem müşteri tarafındaki dinamik arayüzü hem de yönetici tarafındaki stok/sipariş yönetim panelini kapsamaktadır.

## ✨ Öne Çıkan Özellikler

### 👤 Müşteri Paneli
* **Dinamik Sadakat Sistemi (Gamification):**
    * Harcama tutarına göre otomatik seviye atlama (Demir, Bronz, Gümüş, Altın).
    * Görsel ilerleme çubuğu (Progress Bar) ile hedefe kalan tutar takibi.
    * Her seviyeye özel renk temaları ve ayrıcalıklar.
* **Akıllı Pazarlık Modülü:**
    * Müşteriler, sepetteki ürünler için yöneticiye "Fiyat Teklifi" gönderebilir.
    * Yönetici panelinden gelen karşı teklifi kabul etme veya reddetme.
* **Sepet Yönetimi:** Terk edilmiş sepet hatırlatıcıları (Otomatik E-posta).

### 🛡️ Yönetici (Admin) Paneli
* **Dashboard & Analitik:**
    * Toplam ciro, sipariş sayısı ve müşteri metrikleri.
    * **Kritik Stok Uyarısı:** Stoğu azalan ürünlerin otomatik listelenmesi ve uyarı sistemi.
* **Sipariş Yönetimi:**
    * Gelen siparişleri onaylama/reddetme.
    * Müşteriden gelen fiyat tekliflerine "Karşı Teklif" verme mekanizması.

## 🛠️ Kullanılan Teknolojiler

* **Frontend:** React (Vite), Tailwind CSS, Lucide React (İkonlar).
* **Backend:** Node.js, Express.js.
* **Veritabanı:** Supabase (PostgreSQL).
* **Diğer Araçlar:** Nodemailer (Mail servisi), Cron Jobs (Zamanlanmış görevler).

## 🚀 Kurulum (Kendi Bilgisayarınızda Çalıştırma)

Projeyi klonladıktan sonra aşağıdaki adımları izleyin:

### 1. Ön Hazırlık
Gerekli paketleri yükleyin:

```bash
# Ana dizin (Backend) paketleri
npm install

# Client dizini (Frontend) paketleri
cd client
npm install
