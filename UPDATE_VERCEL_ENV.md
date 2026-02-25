# ✅ Vercel 환경 변수 업데이트 필수!

## 🚨 중요: 로컬에서는 작동하지만 Vercel에서는 아직 안 됩니다!

로컬 `.env` 파일은 업데이트되었지만, Vercel 배포를 위해서는 **Vercel Dashboard에서 환경 변수를 업데이트**해야 합니다.

## 📋 업데이트할 환경 변수

다음 값으로 Vercel 환경 변수를 업데이트하세요:

```
REACT_APP_SUPABASE_URL=https://nopdvjhaoivndvytxodr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_NKXmyirg_yWrf7dsY028-Q_n7vWbpq-
```

## 🔧 업데이트 방법

### 1. Vercel Dashboard 접속

1. https://vercel.com/dashboard 열기
2. **SchoolActivity** 프로젝트 선택
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 선택

### 2. 기존 변수 업데이트

#### REACT_APP_SUPABASE_URL
- 기존 값 찾기
- **Edit** 버튼 클릭
- 새 값으로 교체: `https://nopdvjhaoivndvytxodr.supabase.co`
- **Production, Preview, Development** 모두 체크
- **Save** 클릭

#### REACT_APP_SUPABASE_ANON_KEY
- 기존 값 찾기
- **Edit** 버튼 클릭
- 새 값으로 교체: `sb_publishable_NKXmyirg_yWrf7dsY028-Q_n7vWbpq-`
- **Production, Preview, Development** 모두 체크
- **Save** 클릭

### 3. 재배포

환경 변수 업데이트 후 **반드시 재배포**해야 합니다:

1. **Deployments** 탭으로 이동
2. 최신 배포 찾기
3. 배포 옆의 **"..."** 메뉴 클릭
4. **Redeploy** 선택
5. ⚠️ **중요**: **"Use existing Build Cache"** 체크 **해제**
6. **Redeploy** 버튼 클릭

### 4. 배포 완료 대기

- 배포 상태가 "Building" → "Ready"로 변경될 때까지 대기 (약 2-3분)
- 배포 완료 후 사이트 열기
- 회원가입 테스트

## ✅ 테스트 방법

배포 완료 후:

1. 배포된 사이트 접속
2. 브라우저 개발자 도구 열기 (F12)
3. **Console** 탭 확인
4. **회원가입** 버튼 클릭
5. 이메일/비밀번호 입력 후 제출

### 성공 시 콘솔 출력:
```
회원가입 시도: {email: "...", hasPassword: true, name: "..."}
✅ 회원가입 성공: {userId: "...", email: "...", ...}
```

### 실패 시 콘솔 출력:
```
❌ Supabase API 키가 유효하지 않습니다
```
→ Vercel 환경 변수가 아직 업데이트되지 않았거나 재배포하지 않은 경우

## 🔍 로컬에서 확인된 사항

✅ API 키 유효성 테스트 통과:
```bash
curl "https://nopdvjhaoivndvytxodr.supabase.co/auth/v1/health" \
  -H "apikey: sb_publishable_NKXmyirg_yWrf7dsY028-Q_n7vWbpq-"

Response: {"version":"v2.186.0","name":"GoTrue",...}
```

✅ 회원가입 테스트 성공:
```bash
curl -X POST "https://nopdvjhaoivndvytxodr.supabase.co/auth/v1/signup" \
  -H "apikey: sb_publishable_NKXmyirg_yWrf7dsY028-Q_n7vWbpq-" \
  -d '{"email":"testuser@gmail.com","password":"test1234"}'

Response: User created successfully!
```

## 📝 추가 설정 (선택사항)

### 이메일 확인 비활성화

현재 회원가입 시 "confirmation_sent_at"이 표시되어 이메일 확인이 필요합니다.
즉시 로그인하려면:

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Authentication** → **Settings** → **Auth**
4. **Email Auth** 섹션
5. **"Enable email confirmations"** 체크 **해제**
6. **Save**

이렇게 하면 회원가입 후 즉시 로그인 가능합니다.

## 🎯 다음 단계

1. ✅ 로컬 `.env` 파일 업데이트 완료
2. ⏳ Vercel 환경 변수 업데이트 (위 가이드 참고)
3. ⏳ Vercel 재배포 (Build Cache 체크 해제)
4. ⏳ 배포된 사이트에서 회원가입 테스트

모든 단계 완료 후 회원가입과 로그인이 정상 작동할 것입니다! 🚀
