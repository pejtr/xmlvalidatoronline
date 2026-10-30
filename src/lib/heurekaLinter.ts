/**
 * Heureka XML Feed Validator & Linter
 * Validates e-commerce XML feeds against the official Heureka product feed specification:
 * https://sluzby.heureka.cz/napoveda/xml-feed/
 */

export interface HeurekaIssue {
  type: 'error' | 'warning' | 'info';
  itemId?: string;
  tag?: string;
  message: string;
}

export interface HeurekaLintResult {
  isHeurekaFeed: boolean;
  totalItems: number;
  validItems: number;
  itemsWithWarnings: number;
  itemsWithErrors: number;
  issues: HeurekaIssue[];
  itemDetails: Array<{
    id: string;
    name: string;
    price: string;
    url: string;
    delivery: string;
    hasErrors: boolean;
    hasWarnings: boolean;
  }>;
  summary: string;
}

export function lintHeurekaFeed(doc: XMLDocument): HeurekaLintResult {
  const rootElement = doc.documentElement;
  const isHeurekaRoot = rootElement.tagName.toUpperCase() === 'SHOP';

  const shopItems = Array.from(doc.querySelectorAll('SHOPITEM, shopitem, ShopItem'));
  const totalItems = shopItems.length;

  if (!isHeurekaRoot && totalItems === 0) {
    return {
      isHeurekaFeed: false,
      totalItems: 0,
      validItems: 0,
      itemsWithWarnings: 0,
      itemsWithErrors: 0,
      issues: [],
      itemDetails: [],
      summary: 'Dokument není Heureka XML feed (chybí kořenový element <SHOP> a položky <SHOPITEM>).',
    };
  }

  const issues: HeurekaIssue[] = [];
  const itemDetails: HeurekaLintResult['itemDetails'] = [];

  if (rootElement.tagName !== 'SHOP') {
    issues.push({
      type: 'warning',
      tag: rootElement.tagName,
      message: `Kořenový element má název <${rootElement.tagName}>, oficiální specifikace vyžaduje <SHOP>.`,
    });
  }

  if (totalItems === 0) {
    issues.push({
      type: 'error',
      tag: 'SHOPITEM',
      message: 'Feed neobsahuje žádné elementy <SHOPITEM>.',
    });
  }

  let itemsWithErrors = 0;
  let itemsWithWarnings = 0;
  const seenIds = new Set<string>();

  shopItems.forEach((item, index) => {
    let itemHasError = false;
    let itemHasWarning = false;

    const getTag = (name: string): string => {
      const el = item.querySelector(name);
      return el?.textContent?.trim() || '';
    };

    const itemId = getTag('ITEM_ID');
    const productName = getTag('PRODUCTNAME') || getTag('PRODUCT');
    const description = getTag('DESCRIPTION');
    const url = getTag('URL');
    const priceVat = getTag('PRICE_VAT');
    const deliveryDate = getTag('DELIVERY_DATE');
    const imgUrl = getTag('IMGURL');
    const categoryText = getTag('CATEGORYTEXT');
    const ean = getTag('EAN');

    const itemLabel = itemId || `Položka #${index + 1}`;

    // 1. Check ITEM_ID
    if (!itemId) {
      itemHasError = true;
      issues.push({
        type: 'error',
        itemId: itemLabel,
        tag: 'ITEM_ID',
        message: `${itemLabel}: Chybí povinný tag <ITEM_ID> (unikátní identifikátor produktu).`,
      });
    } else {
      if (itemId.length > 64) {
        itemHasWarning = true;
        issues.push({
          type: 'warning',
          itemId,
          tag: 'ITEM_ID',
          message: `${itemLabel}: <ITEM_ID> překračuje doporučených 64 znaků (${itemId.length} znaků).`,
        });
      }
      if (seenIds.has(itemId)) {
        itemHasError = true;
        issues.push({
          type: 'error',
          itemId,
          tag: 'ITEM_ID',
          message: `${itemLabel}: Duplicitní <ITEM_ID> "${itemId}" byl již ve feedu použit.`,
        });
      } else {
        seenIds.add(itemId);
      }
    }

    // 2. Check PRODUCTNAME / PRODUCT
    if (!productName) {
      itemHasError = true;
      issues.push({
        type: 'error',
        itemId: itemLabel,
        tag: 'PRODUCTNAME',
        message: `${itemLabel}: Chybí povinný název produktu <PRODUCTNAME> (nebo <PRODUCT>).`,
      });
    }

    // 3. Check DESCRIPTION
    if (!description) {
      itemHasWarning = true;
      issues.push({
        type: 'warning',
        itemId: itemLabel,
        tag: 'DESCRIPTION',
        message: `${itemLabel}: Doporučeno vyplnit <DESCRIPTION> pro správné párování a vyhledávání.`,
      });
    }

    // 4. Check URL
    if (!url) {
      itemHasError = true;
      issues.push({
        type: 'error',
        itemId: itemLabel,
        tag: 'URL',
        message: `${itemLabel}: Chybí povinný odkaz na produkt <URL>.`,
      });
    } else if (!/^https?:\/\//i.test(url)) {
      itemHasError = true;
      issues.push({
        type: 'error',
        itemId: itemLabel,
        tag: 'URL',
        message: `${itemLabel}: <URL> musí začínat protokolem http:// nebo https:// (zadáno: ${url.slice(0, 30)}...).`,
      });
    }

    // 5. Check PRICE_VAT
    if (!priceVat) {
      itemHasError = true;
      issues.push({
        type: 'error',
        itemId: itemLabel,
        tag: 'PRICE_VAT',
        message: `${itemLabel}: Chybí povinná koncová cena s DPH <PRICE_VAT>.`,
      });
    } else {
      const numPrice = parseFloat(priceVat.replace(',', '.'));
      if (isNaN(numPrice) || numPrice <= 0) {
        itemHasError = true;
        issues.push({
          type: 'error',
          itemId: itemLabel,
          tag: 'PRICE_VAT',
          message: `${itemLabel}: <PRICE_VAT> musí být kladné číslo (zadáno: "${priceVat}").`,
        });
      }
    }

    // 6. Check DELIVERY_DATE
    if (deliveryDate === '') {
      itemHasWarning = true;
      issues.push({
        type: 'warning',
        itemId: itemLabel,
        tag: 'DELIVERY_DATE',
        message: `${itemLabel}: Chybí doba dodání <DELIVERY_DATE> (0 = skladem, celé číslo dní nebo datum).`,
      });
    }

    // 7. Check IMGURL
    if (!imgUrl) {
      itemHasWarning = true;
      issues.push({
        type: 'warning',
        itemId: itemLabel,
        tag: 'IMGURL',
        message: `${itemLabel}: Chybí obrázek produktu <IMGURL>.`,
      });
    }

    // 8. Check CATEGORYTEXT
    if (!categoryText) {
      issues.push({
        type: 'info',
        itemId: itemLabel,
        tag: 'CATEGORYTEXT',
        message: `${itemLabel}: Doporučeno doplnit stromovou kategorii <CATEGORYTEXT> pro párování.`,
      });
    }

    // 9. Check EAN if present
    if (ean && !/^\d{8}(\d{4,6})?$/.test(ean.replace(/\s+/g, ''))) {
      itemHasWarning = true;
      issues.push({
        type: 'warning',
        itemId: itemLabel,
        tag: 'EAN',
        message: `${itemLabel}: <EAN> obvykle obsahuje 8, 12, 13 nebo 14 číslic (zadáno: "${ean}").`,
      });
    }

    if (itemHasError) itemsWithErrors++;
    if (itemHasWarning) itemsWithWarnings++;

    itemDetails.push({
      id: itemId || `item-${index + 1}`,
      name: productName || 'Bez názvu',
      price: priceVat ? `${priceVat} Kč` : '—',
      url: url || '—',
      delivery: deliveryDate !== '' ? `${deliveryDate} d.` : 'neuvedeno',
      hasErrors: itemHasError,
      hasWarnings: itemHasWarning,
    });
  });

  const validItems = totalItems - itemsWithErrors;
  let summary = '';
  if (itemsWithErrors === 0 && itemsWithWarnings === 0) {
    summary = `Všechny položky (${totalItems}) vyhovují Heureka feed specifikaci bez výhrad.`;
  } else if (itemsWithErrors === 0) {
    summary = `Feed je validní (${totalItems} položek), nalezeno ${itemsWithWarnings} doporučení k vylepšení.`;
  } else {
    summary = `Nalezeno ${itemsWithErrors} položek s chybami a ${itemsWithWarnings} položek s varováními z celkových ${totalItems}.`;
  }

  return {
    isHeurekaFeed: true,
    totalItems,
    validItems,
    itemsWithWarnings,
    itemsWithErrors,
    issues,
    itemDetails,
    summary,
  };
}

export const SAMPLE_HEUREKA_XML = `<?xml version="1.0" encoding="utf-8"?>
<SHOP>
  <SHOPITEM>
    <ITEM_ID>SKU-1001</ITEM_ID>
    <PRODUCTNAME>Ergonomická mechanická klávesnice Onyx Pro</PRODUCTNAME>
    <PRODUCT>Ergonomická mechanická klávesnice Onyx Pro, RGB, US layout</PRODUCT>
    <DESCRIPTION>Mechanická klávesnice s optickými spínači, hliníkovým šasi a programovatelným kolečkem.</DESCRIPTION>
    <URL>https://example.com/klavesnice-onyx-pro</URL>
    <IMGURL>https://example.com/images/klavesnice-onyx.jpg</IMGURL>
    <PRICE_VAT>2490</PRICE_VAT>
    <DELIVERY_DATE>0</DELIVERY_DATE>
    <CATEGORYTEXT>Elektronika | Počítače a kancelář | Klávesnice a myši | Klávesnice</CATEGORYTEXT>
    <EAN>8594123456789</EAN>
    <MANUFACTURER>Onyx Hardware</MANUFACTURER>
    <PARAM>
      <PARAM_NAME>Připojení</PARAM_NAME>
      <VAL>Bezdrátové / USB-C</VAL>
    </PARAM>
    <PARAM>
      <PARAM_NAME>Podsvícení</PARAM_NAME>
      <VAL>RGB</VAL>
    </PARAM>
  </SHOPITEM>
  <SHOPITEM>
    <ITEM_ID>SKU-1002</ITEM_ID>
    <PRODUCTNAME>Vertikální bezdrátová myš AeroFlow</PRODUCTNAME>
    <PRODUCT>Vertikální bezdrátová myš AeroFlow, 4000 DPI</PRODUCT>
    <DESCRIPTION>Ergonomická vertikální myš chránící zápěstí před karpálním tunelem.</DESCRIPTION>
    <URL>https://example.com/mys-aeroflow</URL>
    <IMGURL>https://example.com/images/mys-aeroflow.jpg</IMGURL>
    <PRICE_VAT>890.50</PRICE_VAT>
    <DELIVERY_DATE>2</DELIVERY_DATE>
    <CATEGORYTEXT>Elektronika | Počítače a kancelář | Klávesnice a myši | Myši</CATEGORYTEXT>
    <EAN>8594987654321</EAN>
    <MANUFACTURER>AeroFlow</MANUFACTURER>
  </SHOPITEM>
</SHOP>`;
