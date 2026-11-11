"use strict";

SITE.applyHeader();

const paymentMethods = [
  {
    data: PHARMACY.payments.instapay,
    className: "logo-instapay",
    logoImg: "instapay_logo.png"
  },
  {
    data: PHARMACY.payments.vodafoneCash,
    className: "logo-vodafone",
    logoImg: "vodafone_cash_logo.png"
  },
  {
    data: PHARMACY.payments.vodafoneCash2,
    className: "logo-vodafone",
    logoImg: "vodafone_cash_logo.png"
  },
  {
    data: PHARMACY.payments.cibBank,
    className: "logo-bank",
    logoImg: "cib_bank_logo.png"
  }
];

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");
  document.getElementById("toastText").textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
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
      return;
    } catch (_error) {
      // بعض المتصفحات ترفض Clipboard API؛ نستخدم البديل المتوافق أدناه.
    }
  }

  fallbackCopy(text);
}

async function copyText(text, button, defaultLabel) {
  if (!text || text.includes("اكتب")) {
    showToast("عذراً، لم يتم تحديد الرقم بعد");
    return;
  }

  const label = button.querySelector(".btn-label");
  const restoreLabel = defaultLabel || "نسخ الرقم";

  try {
    await writeToClipboard(text);
    button.classList.add("copied");
    label.textContent = "تم النسخ";
    showToast("تم نسخ البيانات إلى الحافظة ✓");

    window.setTimeout(() => {
      button.classList.remove("copied");
      label.textContent = restoreLabel;
    }, 2000);
  } catch (_error) {
    showToast("تعذر النسخ تلقائياً؛ يمكنك نسخه يدوياً");
    window.prompt("انسخ الرقم يدوياً:", text);
  }
}

function getInstaPayGeneralUrl() {
  const userAgent = navigator.userAgent || "";
  const isAndroid = /Android/i.test(userAgent);
  const isIOS =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAndroid) {
    return "intent://#Intent;package=com.egyptianbanks.instapay;end";
  }
  if (isIOS) {
    return "instapay://";
  }
  return "intent://#Intent;package=com.egyptianbanks.instapay;end";
}

const container = document.getElementById("paymentCardsList");
const template = document.getElementById("paymentCardTemplate");

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
  appLink.dataset.analyticsEvent = `${analyticsMethodName}_open_click`;

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
    let resolvedUrl = payment.appUrl;
    if (payment.appUrl === "instapay_general" || (payment.id === "cibBank" && payment.appUrl.includes("instapay_general"))) {
      resolvedUrl = getInstaPayGeneralUrl();
    }

    const userAgent = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/i.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (resolvedUrl.startsWith("intent:") && isIOS) {
      resolvedUrl = "instapay://";
    }

    appLink.href = resolvedUrl;

    if (resolvedUrl.startsWith("intent:") || resolvedUrl.startsWith("instapay:")) {
      appLink.removeAttribute("target");
    } else {
      appLink.target = "_blank";
      appLink.rel = "noopener noreferrer";
    }

    const appLabelEl = appLink.querySelector("span");
    if (appLabelEl && payment.appLabel) {
      appLabelEl.textContent = payment.appLabel;
    }

    appLink.addEventListener("click", () => {
      if (payment.account) {
        try {
          fallbackCopy(payment.account);
        } catch (_e) {}

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(payment.account).catch(() => {});
        }

        const msg = payment.id === "cibBank"
          ? "تم نسخ رقم الحساب وجارٍ فتح إنستاباي... ✓"
          : "تم نسخ الرقم وجارٍ فتح التطبيق... ✓";
        showToast(msg);
      }
    });
  } else {
    appLink.remove();
    actions.classList.add("single");
  }

  container.appendChild(fragment);
});
