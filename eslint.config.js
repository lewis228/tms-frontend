import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // 모달 편집기 패턴: isOpen 토글 시 useEffect 로 form state 를 리셋한다.
      // 이는 zustand 모달 스토어 라는 "외부 시스템과 동기화" 사례라 의도된 사용이고,
      // 14+ 개의 editor-modal 컴포넌트가 동일한 패턴을 따른다.
      // 추후 key 기반 remount 로 바꿀 수 있으나 이번 phase 범위 밖.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  // shadcn/ui 자동 생성 파일은 컴포넌트와 variant 함수(cva 등)를 같은 파일에서 export 하는
  // 관용이 있어 react-refresh/only-export-components 경고가 구조적으로 발생한다.
  // 라이브러리성 코드라 HMR 세밀 경계를 강제할 실익이 없으므로 이 폴더에 한해 해당 룰만 끈다.
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
