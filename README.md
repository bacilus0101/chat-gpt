# 자료 홈페이지

업로드한 HTML 발표 자료를 자동으로 모아 보여주는 홈페이지입니다.

## 사용 방법

1. 새 발표 자료 HTML 파일을 저장소 루트 또는 `materials/` 폴더에 업로드합니다.
2. `main` 브랜치에 반영되면 GitHub Actions가 `scripts/build-homepage.js`를 실행합니다.
3. 스크립트가 HTML 파일의 제목과 첫 설명 문장을 읽어 `index.html` 자료 카드를 다시 만듭니다.

## 현재 등록된 자료

- `preview (1).html`
- `quantum_dot_trends_timeline.html`

## 홈페이지 자동화

- 생성 파일: `index.html`
- 생성 스크립트: `scripts/build-homepage.js`
- 자동 실행: `.github/workflows/update-homepage.yml`

GitHub Pages를 `main` 브랜치의 루트 폴더로 설정하면 `index.html`이 홈페이지로 표시됩니다.
