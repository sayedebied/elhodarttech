"use strict";

SITE.applyHeader();

const config = typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG : (typeof PHARMACY !== "undefined" ? PHARMACY : {});

const addressEl = document.getElementById("addressText");
if (addressEl && config.address) {
  addressEl.textContent = config.address;
}

const mapsTile = document.getElementById("mapsTile");
if (mapsTile && config.mapsUrl) {
  mapsTile.href = config.mapsUrl;
}

const directionsBtn = document.getElementById("directionsBtn");
if (directionsBtn && config.mapsUrl) {
  directionsBtn.href = config.mapsUrl;
}

const encodedMessage = encodeURIComponent(
  config.whatsappMessage || config.prescriptionMsg || "السلام عليكم كنت حابب أستفسر عن"
);

const whatsappBtn = document.getElementById("whatsappOrderBtn") || document.getElementById("rxBtn");
if (whatsappBtn && config.whatsapp) {
  whatsappBtn.href = `https://wa.me/${config.whatsapp}?text=${encodedMessage}`;
}

const whatsappBranchesMap = {
  sales: document.getElementById("waSalesBtn"),
  support: document.getElementById("waSupportBtn")
};

if (Array.isArray(config.whatsappBranches)) {
  config.whatsappBranches.forEach((branch) => {
    const branchEl = whatsappBranchesMap[branch.id];
    if (!branchEl || !branch.whatsapp) return;

    branchEl.href = `https://wa.me/${branch.whatsapp}?text=${encodedMessage}`;
    const roleEl = branchEl.querySelector(".branch-role");
    const numEl = branchEl.querySelector(".branch-number");
    if (roleEl && branch.label) roleEl.textContent = branch.label;
    if (numEl && branch.number) numEl.textContent = branch.number;
  });
} else {
  if (whatsappBranchesMap.sales) {
    whatsappBranchesMap.sales.href = `https://wa.me/201007802888?text=${encodedMessage}`;
  }
  if (whatsappBranchesMap.support) {
    whatsappBranchesMap.support.href = `https://wa.me/201115905060?text=${encodedMessage}`;
  }
}

const facebookLink = document.getElementById("fbTile");
if (facebookLink) {
  if (config.facebookUrl) {
    facebookLink.href = config.facebookUrl;
  } else {
    facebookLink.hidden = true;
  }
}

const instagramLink = document.getElementById("igTile");
if (instagramLink) {
  if (config.instagramUrl) {
    instagramLink.href = config.instagramUrl;
  } else {
    instagramLink.hidden = true;
  }
}

const tiktokLink = document.getElementById("tiktokTile");
if (tiktokLink) {
  if (config.tiktokUrl) {
    const rawTikTok = config.tiktokUrl.trim();
    tiktokLink.href = /^https?:\/\//i.test(rawTikTok)
      ? rawTikTok
      : `https://${rawTikTok}`;
  } else {
    tiktokLink.hidden = true;
  }
}

/**
 * دالة لمعالجة النصوص الخاصة بـ vCard لضمان توافق المعايير (RFC 2426)
 * تقوم بعمل escaping للفواصل والفواصل المنقوطة والشرطات المائلة والأسطر الجديدة
 */
function escapeVCardValue(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * حفظ وتنزيل جهة الاتصال (vCard)
 * يستخدم الملف الثابت contact.vcf الخفيف والمنظم بدلاً من تضمين Base64 الضخم في كود الجافاسكربت
 */
function saveContact() {
  const arabicFileName = `${config.fullName || config.name || "مؤسسة سيد عبيد المتكاملة"}.vcf`;
  const link = document.createElement("a");
  link.href = "contact.vcf";
  link.download = arabicFileName;
  link.setAttribute("target", "_blank");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const saveContactBtn = document.getElementById("saveContactBtn");
if (saveContactBtn) {
  saveContactBtn.addEventListener("click", saveContact);
}
