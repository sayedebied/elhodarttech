/**
 * ====================================================================
 * Smoke Tests - فحوصات التحقق السريعة لمشروع موقع NFC
 * لا يعتمد على أي إطار خارجي ثقيل - يعمل مباشرة عبر Node.js
 * ====================================================================
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${details ? " -> " + details : ""}`);
    failed++;
  }
}

console.log("\n=======================================================");
console.log(" بدء الفحوصات الشاملة للمشروع (Smoke Tests)");
console.log("=======================================================\n");

// --------------------------------------------------------------------
// 1. فحص سلامة صياغة JavaScript
// --------------------------------------------------------------------
console.log("1. فحص سلامة صياغة ملفات JavaScript:");
const jsFiles = [
  "settings.js",
  "site-common.js",
  "index.js",
  "contact.js",
  "payment.js",
  "analytics.js"
];

jsFiles.forEach((file) => {
  try {
    const code = fs.readFileSync(file, "utf8");
    new vm.Script(code);
    assert(true, `سلامة صياغة الكود في ${file}`);
  } catch (err) {
    assert(false, `خطأ في صياغة الكود في ${file}`, err.message);
  }
});

// --------------------------------------------------------------------
// 2. فحص عدم وجود معرفات مكررة (Duplicate IDs)
// --------------------------------------------------------------------
console.log("\n2. فحص عدم وجود IDs مكررة في صفحات HTML:");
const htmlFiles = ["index.html", "contact.html", "payment.html"];

htmlFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const idRegex = /\bid=["']([^"']+)["']/g;
  const ids = [];
  const duplicates = [];
  let match;

  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1];
    if (ids.includes(id)) {
      duplicates.push(id);
    } else {
      ids.push(id);
    }
  }

  assert(
    duplicates.length === 0,
    `عدم وجود IDs مكررة في ${file}`,
    duplicates.length > 0 ? `المعرفات المكررة: ${duplicates.join(", ")}` : ""
  );
});

// --------------------------------------------------------------------
// 3. فحص وجود عناصر DOM التي تستخدمها getElementById
// --------------------------------------------------------------------
console.log("\n3. فحص وجود عناصر DOM المستدعاة بواسطة getElementById:");

function checkDomElements(htmlFile, expectedIds, label) {
  const content = fs.readFileSync(htmlFile, "utf8");
  const missing = [];
  expectedIds.forEach((id) => {
    // نتحقق من وجود المعرف أو بديله المتوافق
    const exists = Array.isArray(id)
      ? id.some((subId) => content.includes(`id="${subId}"`))
      : content.includes(`id="${id}"`);
    if (!exists) {
      missing.push(Array.isArray(id) ? id.join(" أو ") : id);
    }
  });

  assert(
    missing.length === 0,
    `جميع عناصر DOM المطلوبة لـ ${label} متوفرة في ${htmlFile}`,
    missing.length > 0 ? `عناصر مفقودة: ${missing.join(", ")}` : ""
  );
}

// عناصر الهيدر المشتركة
const headerIds = [
  ["businessName", "pharmacyName"],
  "businessEnglishName",
  ["businessTagline", "pharmacyTagline"],
  ["businessStatus", "pharmacyStatus"]
];

checkDomElements("index.html", [
  ...headerIds,
  "statusBadge",
  ["whatsappOrderBtn", "rxBtn"],
  "quickCall",
  "quickWa",
  "quickMap"
], "الصفحة الرئيسية");

checkDomElements("contact.html", [
  ...headerIds,
  "statusBadge",
  "phonesList",
  "whatsappList",
  "waSalesBtn",
  "waSupportBtn",
  "saveContactBtn",
  "fbTile",
  "igTile",
  "tiktokTile",
  "mapsTile",
  ["whatsappOrderBtn", "rxBtn"],
  "addressText",
  "directionsBtn"
], "صفحة التواصل");

checkDomElements("payment.html", [
  ["businessName", "pharmacyName"],
  "businessEnglishName",
  "paymentCardsList",
  "toast",
  "toastText",
  "paymentCardTemplate"
], "صفحة الدفع");

// --------------------------------------------------------------------
// 4. فحص وجود جميع الملفات المحلية المشار إليها
// --------------------------------------------------------------------
console.log("\n4. فحص وجود الملفات المحلية المشار إليها:");
const referencedFiles = new Set();

htmlFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const srcRegex = /\b(?:src|href)=["']([^"':#?]+)(?:\?[^"']*)?["']/g;
  let match;
  while ((match = srcRegex.exec(content)) !== null) {
    const ref = match[1];
    // تجاهل الروابط الخارجية وروابط التيل والواتساب
    if (!ref.startsWith("http") && !ref.startsWith("tel:") && !ref.startsWith("mailto:") && !ref.startsWith("data:")) {
      referencedFiles.add(ref);
    }
  }
});

// فحص مراجع الصور في settings.js
const settingsCode = fs.readFileSync("settings.js", "utf8");
const assetMatches = settingsCode.match(/["']([a-zA-Z0-9_\-\/]+\.(?:png|jpg|jpeg|svg|vcf))["']/g) || [];
assetMatches.forEach((m) => {
  const clean = m.replace(/["']/g, "");
  referencedFiles.add(clean);
});

// فحص مراجع CSS
const cssCode = fs.readFileSync("style.css", "utf8");
const cssMatches = cssCode.match(/url\(["']?([^"')]+)["']?\)/g) || [];
cssMatches.forEach((m) => {
  const clean = m.replace(/url\(["']?/, "").replace(/["']?\)/, "");
  if (!clean.startsWith("data:") && !clean.startsWith("http")) {
    referencedFiles.add(clean);
  }
});

referencedFiles.forEach((f) => {
  const exists = fs.existsSync(f);
  assert(exists, `الملف المشار إليه موجود: ${f}`);
});

// --------------------------------------------------------------------
// 5. اتساق وسائل الدفع وعدم ظهور «اتصالات كاش» ما لم تكن مهيأة
// --------------------------------------------------------------------
console.log("\n5. فحص اتساق وسائل الدفع وعدم ظهور «اتصالات كاش»:");

const allCodeFiles = [
  "index.html",
  "contact.html",
  "payment.html",
  "settings.js",
  "payment.js",
  "README.md"
];

let etisalatFound = false;
allCodeFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("اتصالات كاش") || content.includes("اتصالات وفودافون")) {
    etisalatFound = true;
    console.error(`  [WARN] تم العثور على إشارة لاتصالات في: ${file}`);
  }
});

assert(!etisalatFound, "عدم وجود أي ذكر لـ «اتصالات كاش» في النصوص والملفات");

// فحص تواجد وسائل الدفع المعتمدة
const paymentHtml = fs.readFileSync("payment.html", "utf8");
const indexHtml = fs.readFileSync("index.html", "utf8");
const contactHtml = fs.readFileSync("contact.html", "utf8");

assert(indexHtml.includes("إنستاباي • حساب بنكي CIB • فودافون كاش"), "توحيد نص وسائل الدفع في index.html");
assert(contactHtml.includes("إنستاباي • حساب بنكي CIB • فودافون كاش"), "توحيد نص وسائل الدفع في contact.html");
assert(paymentHtml.includes("InstaPay وفودافون كاش وحساب بنك CIB"), "تحديث وصف وسائل الدفع في payment.html");

// --------------------------------------------------------------------
// 6. فحص التباين اللوني (WCAG AA) لدرجة اللون الذهبي
// --------------------------------------------------------------------
console.log("\n6. فحص نسبة التباين لألوان النصوص الذهبية (WCAG AA):");

function getLuminance(hex) {
  const rgb = hex.replace("#", "").match(/.{2}/g).map((x) => parseInt(x, 16) / 255);
  const a = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrast(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// فحص اللون الذهبي المعتمد للنصوص: #8a5806 على الأبيض #ffffff
const goldDark = "#8a5806";
const contrastWhite = getContrast(goldDark, "#ffffff");
const contrastLightGold = getContrast(goldDark, "#fef8eb");
const contrastWaBadge = getContrast("#146c36", "#eafaf1");

assert(
  contrastWhite >= 4.5,
  `نسبة تباين اللون الذهبي الداكن على الأبيض (${contrastWhite.toFixed(2)}:1 >= 4.5:1 WCAG AA)`
);
assert(
  contrastLightGold >= 4.5,
  `نسبة تباين اللون الذهبي الداكن على الخلفية الفاتحة (${contrastLightGold.toFixed(2)}:1 >= 4.5:1 WCAG AA)`
);
assert(
  contrastWaBadge >= 4.5,
  `نسبة تباين شارة الواتساب على الخلفية الخضراء الفاتحة (${contrastWaBadge.toFixed(2)}:1 >= 4.5:1 WCAG AA)`
);

// --------------------------------------------------------------------
// 7. فحص كارت الواتساب وإزالة بطاقة الواتساب من الشبكة في contact.html
// --------------------------------------------------------------------
console.log("\n7. فحص كارت الواتساب المزدوج في contact.html:");
assert(!contactHtml.includes('id="waTile"'), "تمت إزالة بطاقة واتساب المنفردة (waTile) من شبكة روابط التواصل");

const waSectionMatch = contactHtml.match(/id="whatsappList"[\s\S]*?<\/div>\s*<\/div>/);
const waSection = waSectionMatch ? waSectionMatch[0] : "";
assert(waSection.includes("01007802888"), "كارت الواتساب يتضمن رقم المبيعات 01007802888");
assert(waSection.includes("01115905060"), "كارت الواتساب يتضمن رقم خدمة العملاء 01115905060");
assert(!waSection.includes("01009770070"), "كارت الواتساب يقتصر على الرقمين المطلوبين فقط دون الإدارة");

// --------------------------------------------------------------------
// 8. فحص ملف vCard الثابت (contact.vcf)
// --------------------------------------------------------------------
console.log("\n8. فحص ملف جهة الاتصال الثابت (contact.vcf):");
const vcfExists = fs.existsSync("contact.vcf");
assert(vcfExists, "وجود ملف contact.vcf على المسار الرئيسي");

if (vcfExists) {
  const vcfContent = fs.readFileSync("contact.vcf", "utf8");
  assert(vcfContent.startsWith("BEGIN:VCARD"), "يبدأ بـ BEGIN:VCARD");
  assert(vcfContent.includes("END:VCARD"), "ينتهي بـ END:VCARD");
  assert(vcfContent.includes("VERSION:3.0"), "يدعم الإصدار 3.0");
  assert(vcfContent.includes("CHARSET=UTF-8"), "يدعم ترميز UTF-8 للنصوص العربية");
  assert(vcfContent.includes("01007802888"), "يتضمن رقم المبيعات");
  assert(vcfContent.includes("01115905060"), "يتضمن رقم الدعم");
  assert(vcfContent.includes("01009770070"), "يتضمن رقم الإدارة");
  assert(vcfContent.includes("PHOTO;ENCODING=b;TYPE=JPEG:"), "يتضمن صورة الشعار المعتمدة");
}

// --------------------------------------------------------------------
// النتيجة النهائية
// --------------------------------------------------------------------
console.log("\n=======================================================");
console.log(` ملخص النتائج: ${passed} فحص ناجح | ${failed} فحص فاشل`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
