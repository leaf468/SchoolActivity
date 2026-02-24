# Vercel 배포 가이드

## 필수 환경 변수 설정

Vercel Dashboard에서 다음 환경 변수들을 설정해야 합니다:

### 1. Vercel Dashboard 접속
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택 (SchoolActivity)
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭

### 2. 환경 변수 추가

다음 환경 변수들을 추가하세요:

#### Supabase 설정 (필수)
```
Name: REACT_APP_SUPABASE_URL
Value: [Supabase 프로젝트 URL]
Environments: Production, Preview, Development
```

```
Name: REACT_APP_SUPABASE_ANON_KEY
Value: [Supabase Anon/Public Key]
Environments: Production, Preview, Development
```

#### OpenAI 설정 (필수)
```
Name: REACT_APP_OPENAI_API_KEY
Value: [OpenAI API Key]
Environments: Production, Preview, Development
```

```
Name: REACT_APP_OPENAI_MODEL
Value: gpt-4o
Environments: Production, Preview, Development
```

### 3. Supabase 설정값 찾기

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **API** 이동
4. 다음 값들을 복사:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon/public key** → `REACT_APP_SUPABASE_ANON_KEY`

### 4. OpenAI API Key 찾기

1. https://platform.openai.com/api-keys 접속
2. API Key 생성 또는 기존 키 사용
3. 키를 복사하여 `REACT_APP_OPENAI_API_KEY`에 설정

### 5. 재배포

환경 변수 추가 후:
1. **Deployments** 탭으로 이동
2. 최신 배포의 **"..."** 메뉴 클릭
3. **Redeploy** 선택
4. ⚠️ **"Use existing Build Cache"** 체크 해제
5. **Redeploy** 버튼 클릭

## 문제 해결

### 배포가 실패하는 경우
1. 환경 변수가 모두 설정되었는지 확인
2. Build Cache를 사용하지 않고 재배포
3. Production Branch가 "main"으로 설정되었는지 확인 (Settings → Git)

### 여전히 "supabaseUrl is required" 에러가 나는 경우
1. 브라우저 콘솔에서 에러 메시지 확인
2. 환경 변수 이름이 정확한지 확인 (대소문자 구분)
3. 모든 Environment (Production, Preview, Development)에 설정했는지 확인

### GitHub Integration 문제
1. Settings → Git에서 GitHub 연결 상태 확인
2. 필요시 Disconnect 후 다시 Connect
3. Production Branch가 "main"인지 확인

## 로컬 개발 환경 설정

로컬에서 개발할 때는 `frontend/.env` 파일을 생성하세요:

```bash
cd frontend
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력
```

`.env` 파일 예시:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_OPENAI_API_KEY=sk-your-openai-key-here
REACT_APP_OPENAI_MODEL=gpt-4o
```

⚠️ **주의**: `.env` 파일은 절대 Git에 커밋하지 마세요! (이미 `.gitignore`에 포함됨)
