// =========================================================
// إعدادات وبيانات مؤسسة سيد عبيد المتكاملة (ElHoda & RT Tech)
// =========================================================

const SITE_CONFIG = {
  // البيانات الأساسية للنشاط
  name: "مؤسسة سيد عبيد المتكاملة",
  englishName: "ElHoda & RT Tech",
  fullName: "مؤسسة سيد عبيد المتكاملة ElHoda & RT Tech",
  owner: "سيد عبيد",
  activity: "حلول الكهرباء و الإضاءة و الأنظمة الذكية و المراقبة",
  tagline: "حلول ذكية لمستقبل أفضل",

  // الشعار المعتمد النهائي (نسخ محسّنة وسريعة التحميل لجميع الشاشات)
  logo: "client_assets/logo/ultimate-avatar-hero.png",
  logoOriginal: "client_assets/logo/ultimate-logo-transparent.png",
  favicon: "client_assets/logo/favicon-64x64.png",
  favicon32: "client_assets/logo/favicon-32x32.png",
  appleTouchIcon: "client_assets/logo/apple-touch-icon.png",

  // مواعيد العمل (كل يوم من 9 صباحًا حتى 2 بعد منتصف الليل ما عدا الجمعة إجازة)
  hours: {
    mode: "schedule",
    timezone: "Africa/Cairo",
    opensAt: 9,   // 9:00 صباحًا
    closesAt: 2,  // 2:00 بعد منتصف الليل
    closedWeekday: "Friday",
    openLabel: "مفتوح الآن • من 9 ص حتى 2 ص",
    closedLabel: "مغلق الآن • مواعيدنا 9 ص - 2 ص",
    fridayClosedLabel: "مغلق الآن • الجمعة إجازة"
  },

  // أرقام التواصل
  phone: "01009770070",
  phones: [
    { id: "sales", label: "المبيعات", number: "01007802888" },
    { id: "support", label: "خدمة العملاء", number: "01115905060" },
    { id: "management", label: "الإدارة", number: "01009770070" }
  ],
  whatsappLocal: "01009770070",
  whatsapp: "201009770070", // كود مصر 20 بدون علامة + لروابط wa.me
  whatsappBranches: [
    { id: "sales", label: "المبيعات", number: "01007802888", whatsapp: "201007802888" },
    { id: "support", label: "خدمة العملاء", number: "01115905060", whatsapp: "201115905060" }
  ],

  // الرسالة الجاهزة التي تظهر عند فتح واتساب
  whatsappMessage: "السلام عليكم كنت حابب أستفسر عن",
  prescriptionMsg: "السلام عليكم كنت حابب أستفسر عن", // للتوافق العكسي مع الكود القديم

  // البريد الإلكتروني (إن وجد)
  email: "",

  // العنوان ورابط الموقع على Google Maps
  address: "طريق المنصورية، الكوبري البحري ، بجوار مسجد أولاد سالم، أبو رواش ،كرداسة، الجيزة.",
  mapsUrl: "https://maps.app.goo.gl/axVzn7anTFBvDVs88?g_st=aw",

  // حسابات التواصل الاجتماعي
  facebookUrl: "https://www.facebook.com/share/1EBi9rePNh/",
  instagramUrl: "https://www.instagram.com/sayedebiedelc?mdxt=MWwwYXh3MTdhOW5wdA==",
  tiktokUrl: "https://www.tiktok.com/@sayed.ebied1",
  youtubeUrl: "",

  // Google Analytics Measurement ID (يُترك فارغًا حتى إنشاء Property خاصة بالعميل)
  analyticsId: "",

  // وسائل الدفع والتحويل الإلكتروني
  payments: {
    instapay: {
      id: "instapay",
      label: "InstaPay (إنستاباي)",
      account: "01009770070",
      nameHolder: "elsayed mahmoud",
      note: "تحويل فوري عبر شبكة المدفوعات اللحظية",
      logo: "instapay_logo.png",
      appUrl: "https://ipn.eg/S/syd.mahmoud/instapay/5gJ2be"
    },
    vodafoneCash: {
      id: "vodafoneCash",
      label: "Vodafone Cash (فودافون كاش)",
      account: "01009770070",
      nameHolder: "السيد محمود محمد مهدي",
      note: "تحويل لمحفظة فودافون كاش",
      logo: "vodafone_cash_logo.png",
      appUrl: "https://vf.eg/vfcash?id=mt&qrId=ZrqSPy"
    },
    vodafoneCash2: {
      id: "vodafoneCash2",
      label: "Vodafone Cash (فودافون كاش)",
      account: "01115905060",
      nameHolder: "محفظة فودافون كاش",
      note: "تحويل لمحفظة فودافون كاش",
      logo: "vodafone_cash_logo.png",
      appUrl: "https://vf.eg/vfcash?id=mt&qrId=SR4Sw2"
    },
    cibBank: {
      id: "cibBank",
      label: "حساب البنك التجاري الدولي (CIB)",
      account: "100072381631",
      nameHolder: "البنك التجاري الدولي - مصر (رقم الحساب)",
      note: "تحويل لحساب البنك عبر إنستاباي أو التحويل البنكي",
      copyLabel: "نسخ رقم الحساب",
      appLabel: "فتح إنستاباي",
      logo: "cib_bank_logo.png",
      appUrl: "intent://open#Intent;scheme=ipn;package=com.egyptianbanks.instapay;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.egyptianbanks.instapay;end",
      iosAppUrl: "ipn://open",
      appStoreUrl: "https://apps.apple.com/eg/app/instapay-egypt/id1592109205",
      playStoreUrl: "https://play.google.com/store/apps/details?id=com.egyptianbanks.instapay"
    }
  }
};

// للتوافق العكسي مع أي إشارات سابقة
const PHARMACY = SITE_CONFIG;
