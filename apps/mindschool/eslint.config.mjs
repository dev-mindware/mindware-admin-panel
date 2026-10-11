import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Next 16 já traz as regras em formato «flat»: não é preciso `FlatCompat` (que falha com o plugin React). */
const eslintConfig = defineConfig([...nextVitals, ...nextTs, globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"])]);

export default eslintConfig;
