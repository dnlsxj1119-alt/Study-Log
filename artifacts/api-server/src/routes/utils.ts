import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/extract-title", async (req, res): Promise<void> => {
  const { url } = req.body as { url?: unknown };

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL을 입력해주세요." });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "유효하지 않은 URL입니다." });
    return;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    res.status(400).json({ error: "http 또는 https URL만 지원합니다." });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      res.status(502).json({ error: `기사 페이지를 불러올 수 없습니다. (HTTP ${response.status})` });
      return;
    }

    const html = await response.text();

    function extractMeta(property: string): string | undefined {
      const escapedProp = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const patterns = [
        new RegExp(
          `<meta[\\s\\S]*?property=["']${escapedProp}["'][\\s\\S]*?content=["']([^"']+)["']`,
          "i",
        ),
        new RegExp(
          `<meta[\\s\\S]*?content=["']([^"']+)["'][\\s\\S]*?property=["']${escapedProp}["']`,
          "i",
        ),
        new RegExp(
          `<meta[\\s\\S]*?name=["']${escapedProp}["'][\\s\\S]*?content=["']([^"']+)["']`,
          "i",
        ),
        new RegExp(
          `<meta[\\s\\S]*?content=["']([^"']+)["'][\\s\\S]*?name=["']${escapedProp}["']`,
          "i",
        ),
      ];
      for (const p of patterns) {
        const m = html.match(p);
        if (m?.[1]?.trim()) return m[1].trim();
      }
      return undefined;
    }

    const ogTitle = extractMeta("og:title");
    const twitterTitle = extractMeta("twitter:title");
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

    let title = (ogTitle || twitterTitle || titleTag || "").trim();

    title = title
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!title) {
      res.status(404).json({ error: "기사 제목을 찾을 수 없습니다." });
      return;
    }

    req.log.info({ url, title }, "Title extracted");
    res.json({ title });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      res.status(504).json({ error: "기사 페이지 로딩 시간이 초과됐습니다." });
      return;
    }
    req.log.warn({ err, url }, "Failed to extract title");
    res.status(500).json({ error: "기사 제목 추출에 실패했습니다." });
  }
});

export default router;
