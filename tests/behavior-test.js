/**
 * ====================================================================
 * Behavior Tests - اختبارات محاكاة التفاعل والوظائف
 * ====================================================================
 */

const fs = require("fs");
const vm = require("vm");

let passed = 0;
let failed = 0;

function assert(condition, name, details = "") {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}${details ? " -> " + details : ""}`);
    failed++;
  }
}

console.log("\n=======================================================");
console.log(" بدء اختبارات السلوك والروابط (Behavior Tests)");
console.log("=======================================================\n");

// 1. تحميل إعدادات SITE_CONFIG
const settingsCode = fs.readFileSync("settings.js", "utf8");
const sandbox = {};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(settingsCode + "\n;globalThis.SITE_CONFIG = SITE_CONFIG;", sandbox);
const config = sandbox.SITE_CONFIG;

assert(!!config, "تحميل كائن SITE_CONFIG بنجاح");
assert(config.whatsapp === "201009770070", "رقم واتساب صحيح للرابط الدولي");
assert(config.phone === "01009770070", "رقم الهاتف الأساسي صحيح");
assert(config.mapsUrl.includes("maps.app.goo.gl"), "رابط خرائط جوجل صحيح");

// 2. فحص روابط واتساب المولدة وفروع كارت الواتساب
const msg = encodeURIComponent(config.whatsappMessage);
const expectedWaUrl = `https://wa.me/${config.whatsapp}?text=${msg}`;
assert(expectedWaUrl.startsWith("https://wa.me/201009770070?text="), "تنسيق رابط واتساب wa.me صحيح");
assert(Array.isArray(config.whatsappBranches) && config.whatsappBranches.length === 2, "كارت الواتساب مهيأ بخانتين فقط في settings.js");
assert(config.whatsappBranches[0].number === "01007802888" && config.whatsappBranches[0].whatsapp === "201007802888", "الخانة الأولى في كارت الواتساب مخصصة لـ 01007802888");
assert(config.whatsappBranches[1].number === "01115905060" && config.whatsappBranches[1].whatsapp === "201115905060", "الخانة الثانية في كارت الواتساب مخصصة لـ 01115905060");

// 3. فحص بيانات الدفع في settings.js
const payments = config.payments;
assert(payments.instapay.account === "01009770070", "حساب إنستاباي الشخصي سليم ولم يتغير");
assert(payments.instapay.appUrl === "https://ipn.eg/S/syd.mahmoud/instapay/5gJ2be", "رابط إنستاباي الشخصي سليم");
assert(payments.vodafoneCash.account === "01009770070", "رقم فودافون كاش الأول سليم ولم يتغير");
assert(payments.vodafoneCash2.account === "01115905060", "رقم فودافون كاش الثاني سليم ولم يتغير");
assert(payments.cibBank.account === "100072381631", "رقم حساب بنك CIB سليم ولم يتغير");

// 4. فحص رابط InstaPay لحساب CIB مع رابط Fallback لمتجر Google Play
const cibAppUrl = payments.cibBank.appUrl;
assert(cibAppUrl.includes("package=com.egyptianbanks.instapay"), "نية أندرويد تتضمن حزمة تطبيق إنستاباي");
assert(cibAppUrl.includes("S.browser_fallback_url="), "نية أندرويد تتضمن رابط بديل (fallback) للمتجر في حال عدم التثبيت");
assert(payments.cibBank.iosAppUrl === "ipn://open", "رابط iOS لتطبيق إنستاباي مهيأ كـ ipn://open");

// 5. فحص استجابة CSS لشاشات الهواتف الصغيرة (Small Mobile Viewport < 360px & <= 520px)
const css = fs.readFileSync("style.css", "utf8");
assert(css.includes("@media (max-width: 359px)"), "دعم شاشات الهواتف شديدة الصغر (< 360px)");
assert(css.includes("@media (max-width: 520px)"), "دعم شاشات الهواتف الذكية القياسية (<= 520px)");
assert(css.includes("@media (min-width: 521px)"), "دعم شاشات سطح المكتب والتابلت (> 520px)");
assert(css.includes(":focus-visible"), "وجود تنسيق واضح ومخصص لـ focus-visible");
assert(css.includes("prefers-reduced-motion"), "وجود دعم لخاصية تقليل الحركة prefers-reduced-motion");
assert(css.includes(".call-branches-two") && css.includes("repeat(2, 1fr)"), "وجود تنسيق شبكة العمودين لكارت الواتساب (.call-branches-two)");
assert(css.includes(".branch-wa-badge"), "وجود تنسيق شارة الواتساب (.branch-wa-badge)");

// 6. فحص أبعاد أهداف اللمس (Touch Targets)
assert(css.includes("min-height: 44px") || css.includes("min-height: 48px"), "أهداف اللمس تلبي معيار الحجم الأدنى (44px)");

// 7. فحص سلامة ملف vCard والتنقل
const vcf = fs.readFileSync("contact.vcf", "utf8");
assert(vcf.includes("FN;CHARSET=UTF-8:مؤسسة سيد عبيد المتكاملة - ElHoda & RT Tech"), "اسم vCard العربي سليم");
assert(vcf.includes("TEL;TYPE=WORK,VOICE:01007802888"), "رقم المبيعات سليم في vCard");
assert(vcf.includes("TEL;TYPE=WORK,VOICE:01115905060"), "رقم خدمة العملاء سليم في vCard");
assert(vcf.includes("TEL;TYPE=WORK,VOICE:01009770070"), "رقم الإدارة سليم في vCard");
assert(vcf.includes("TEL;TYPE=CELL,VOICE,MSG:+201009770070"), "رقم الواتساب سليم في vCard");

console.log("\n=======================================================");
console.log(` ملخص النتائج: ${passed} فحص ناجح | ${failed} فحص فاشل`);
console.log("=======================================================\n");

if (failed > 0) process.exit(1);
