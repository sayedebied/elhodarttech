"use strict";

SITE.applyHeader();

const config = typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG : (typeof PHARMACY !== "undefined" ? PHARMACY : {});
const payments = config.payments || {};

const paymentMethods = [
  {
    data: payments.instapay,
    className: "logo-instapay",
    logoImg: "instapay_logo.png"
  },
  {
    data: payments.vodafoneCash,
    className: "logo-vodafone",
    logoImg: "vodafone_cash_logo.png"
  },
  {
    data: payments.vodafoneCash2,
    className: "logo-vodafone",
    logoImg: "vodafone_cash_logo.png"
  },
  {
    data: payments.cibBank,
    className: "logo-bank",
    logoImg: "cib_bank_logo.png"
  }
];

let toastTimer;

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), duration);
}

function fallbackCopy(text) {
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.className = "clipboard-helper";
  document.body.appendChild(helper);
  helper.select();
  helper.setSelectionRange(0, helper.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    helper.remove();
  }

  if (!copied) throw new Error("Clipboard fallback failed");
}

async function writeToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      // ننتقل للبديل أدناه إذا رفض المتصفح
    }
  }

  try {
    fallbackCopy(text);
    return true;
  } catch (_e) {
    return false;
  }
}

async function copyText(text, button, defaultLabel) {
  if (!text || text.includes("اكتب")) {
    showToast("عذراً، لم يتم تحديد الرقم بعد");
    return;
  }

  const label = button.querySelector(".btn-label");
  const restoreLabel = defaultLabel || "نسخ الرقم";

  const success = await writeToClipboard(text);
  if (success) {
    button.classList.add("copied");
    if (label) label.textContent = "تم النسخ";
    showToast("تم نسخ البيانات إلى الحافظة ✓");

    window.setTimeout(() => {
      button.classList.remove("copied");
      if (label) label.textContent = restoreLabel;
    }, 2000);
  } else {
    showToast("تعذر النسخ تلقائياً؛ يمكنك نسخه يدوياً");
    window.prompt("انسخ الرقم يدوياً:", text);
  }
}

/**
 * فحص نوع الجهاز لدعم فتح التطبيقات دون الاعتماد الكلي على user-agent فقط
 */
function getDeviceContext() {
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  const isMobile = isAndroid || isIOS || (isTouch && isSmallScreen);

  return { isAndroid, isIOS, isMobile };
}

/**
 * معالجة زر فتح إنستاباي لحساب بنك CIB:
 * 1. نسخ رقم الحساب دائمًا.
 * 2. التعامل الذكي مع المنصات المختلفة (Android / iOS / Desktop).
 * 3. توفير رسائل توجيه وبدائل واضحة دون ترك المستخدم أمام روابط فاشلة.
 */
async function handleCibInstaPayClick(event, payment) {
  const { isAndroid, isIOS, isMobile } = getDeviceContext();

  // 1. نسخ رقم الحساب أولاً
  if (payment.account) {
    await writeToClipboard(payment.account);
  }

  // 2. إذا كان المستخدم على جهاز سطح مكتب (Desktop)
  if (!isMobile) {
    event.preventDefault();
    showToast(
      `تم نسخ رقم الحساب (${payment.account}) ✓ — تطبيق إنستاباي متاح للهواتف (Android و iOS)`,
      4000
    );
    return;
  }

  // 3. إذا كان جهاز أندرويد
  if (isAndroid) {
    showToast("تم نسخ رقم الحساب وجارٍ فتح إنستاباي... ✓", 2500);
    // الرابط مهيأ مسبقاً كـ intent يحتوي على S.browser_fallback_url إلى متجر Google Play
    return;
  }

  // 4. إذا كان جهاز iOS (آيفون / آيباد)
  if (isIOS) {
    event.preventDefault();
    showToast("تم نسخ رقم الحساب وجارٍ فتح إنستاباي... ✓", 2500);

    let appOpened = false;
    const handleVisibility = () => {
      if (document.hidden) appOpened = true;
    };
    document.addEventListener("visibilitychange", handleVisibility, { once: true });

    // محاولة فتح التطبيق
    window.location.href = payment.iosAppUrl || "ipn://open";

    // بديل واضح في حالة عدم تثبيت التطبيق
    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (!appOpened && !document.hidden) {
        showToast("إذا لم يفتح التطبيق، يرجى التأكد من تثبيت إنستاباي من App Store", 4000);
      }
    }, 2000);
  }
}

const container = document.getElementById("paymentCardsList");
const template = document.getElementById("paymentCardTemplate");

if (container && template) {
  paymentMethods.forEach((method) => {
    const payment = method.data;
    if (!payment || !payment.account) return;

    const analyticsMethodName = {
      instapay: "instapay",
      cibBank: "cib_bank",
      vodafoneCash: "vodafone_cash_1",
      vodafoneCash2: "vodafone_cash_2"
    }[payment.id] || "payment";

    const fragment = template.content.cloneNode(true);
    const logoBox = fragment.querySelector(".payment-logo");
    const logo = fragment.querySelector(".payment-logo img");
    const actions = fragment.querySelector(".payment-actions");
    const copyButton = fragment.querySelector(".btn-copy");
    const copyLabelEl = copyButton.querySelector(".btn-label");
    const appLink = fragment.querySelector(".btn-app");

    const defaultCopyLabel = payment.copyLabel || "نسخ الرقم";
    if (copyLabelEl) copyLabelEl.textContent = defaultCopyLabel;

    copyButton.dataset.analyticsEvent = `${analyticsMethodName}_copy_click`;
    if (appLink) appLink.dataset.analyticsEvent = `${analyticsMethodName}_open_click`;

    logoBox.classList.add(method.className);
    logo.src = payment.logo || method.logoImg;
    logo.alt = payment.label;
    fragment.querySelector(".payment-name").textContent = payment.label;
    fragment.querySelector(".payment-note").textContent =
      payment.note || "تحويل إلكتروني";
    fragment.querySelector(".account-holder").textContent =
      payment.nameHolder || "الحساب الرسمي";
    fragment.querySelector(".account-number").textContent = payment.account;

    copyButton.addEventListener("click", () =>
      copyText(payment.account, copyButton, defaultCopyLabel)
    );

    if (payment.appUrl) {
      const isCustomScheme =
        payment.appUrl.startsWith("intent:") ||
        payment.appUrl.startsWith("ipn:") ||
        payment.appUrl.startsWith("instapay:");

      appLink.href = payment.appUrl;

      if (isCustomScheme) {
        appLink.removeAttribute("target");
        appLink.removeAttribute("rel");
      } else {
        // روابط الويب العادية (HTTPS) تفتح بأمان في نافذة جديدة
        appLink.target = "_blank";
        appLink.rel = "noopener noreferrer";
      }

      const appLabelEl = appLink.querySelector("span");
      if (appLabelEl && payment.appLabel) {
        appLabelEl.textContent = payment.appLabel;
      }

      if (payment.id === "cibBank") {
        appLink.addEventListener("click", (e) => handleCibInstaPayClick(e, payment));
      }
    } else {
      if (appLink) appLink.remove();
      if (actions) actions.classList.add("single");
    }

    container.appendChild(fragment);
  });
}
