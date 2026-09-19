import fs from "node:fs"
import path from "node:path"

/**
 * Build-time sanity check on the resume.
 *
 * The dossier links always render, so a missing PDF ships as a broken download
 * rather than quietly hiding itself. This warns loudly at build and at dev
 * startup so that cannot go unnoticed. It is only a warning — the build still
 * succeeds, since the file is often added at deploy time.
 */
const RESUME_FILE = "praful-chikhle-resume.pdf"

if (!fs.existsSync(path.join(process.cwd(), "public", RESUME_FILE))) {
  console.warn(
    `\n[avionics] WARNING: no resume at public/${RESUME_FILE}\n` +
      `           The DOSSIER links render anyway and will 404 until it exists.\n` +
      `           Add the file, or point OPERATOR.resume (lib/site-data.ts) at a hosted URL.\n`
  )
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
}

export default nextConfig
