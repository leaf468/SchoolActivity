# 🚨 Supabase 인증 문제 해결

## 문제: Invalid API key

회원가입/로그인이 안 되는 이유는 **Supabase API Key가 유효하지 않기 때문**입니다.

```
{"message":"Invalid API key","hint":"Double check your Supabase `anon` or `service_role` API key."}
```

## 해결 방법: 올바른 API Key 가져오기

### 1. Supabase Dashboard 접속

1. https://supabase.com/dashboard 접속
2. 로그인
3. 프로젝트 선택 (또는 새 프로젝트 생성)

### 2. API 키 확인

1. 왼쪽 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 선택
3. **Project API keys** 섹션에서 다음 정보 복사:

```
Project URL: https://[your-project-ref].supabase.co
anon public key: eyJhbGc...
```

### 3. 로컬 환경 변수 업데이트

`frontend/.env` 파일을 열고 다음 값을 **정확히** 업데이트:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://[your-project-ref].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[your-actual-anon-key]
```

⚠️ **주의**:
- `[your-project-ref]`를 실제 프로젝트 ref로 교체
- `[your-actual-anon-key]`를 실제 anon key로 교체
- 따옴표나 공백 없이 값만 입력

### 4. Vercel 환경 변수 업데이트

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 다음 변수 업데이트:

```
REACT_APP_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY
```

각 변수를:
- **Production, Preview, Development** 모두 체크
- 값 입력 후 **Save**

### 5. 재배포

Vercel에서:
1. **Deployments** 탭
2. 최신 배포의 **"..."** 메뉴
3. **Redeploy**
4. ⚠️ **"Use existing Build Cache" 체크 해제**
5. **Redeploy** 클릭

### 6. 로컬 서버 재시작

```bash
cd frontend
# 서버 종료 (Ctrl+C)
npm start
```

## 테스트

1. 브라우저에서 http://localhost:3000 접속
2. **회원가입** 클릭
3. 이메일/비밀번호 입력
4. 브라우저 콘솔(F12) 확인:
   - ✅ `회원가입 시도:` 로그 표시
   - ✅ `✅ 회원가입 성공:` 표시되면 성공!
   - ❌ `Invalid API key` → API 키 다시 확인

## 추가 확인 사항

### Supabase 프로젝트가 없는 경우

1. https://supabase.com 에서 새 프로젝트 생성
2. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택
3. 생성 완료 후 위의 "API 키 확인" 단계 진행

### 데이터베이스 테이블 설정

프로젝트가 새로 생성된 경우, 다음 SQL을 실행해야 합니다:

1. Supabase Dashboard → **SQL Editor**
2. 다음 SQL 실행:

```sql
-- user_profiles 테이블 생성
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  school TEXT,
  grade TEXT,
  semester TEXT,
  target_university TEXT,
  target_major TEXT,
  university_slogan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 이메일 확인 비활성화

회원가입 후 즉시 로그인하려면:

1. **Authentication** → **Settings** → **Auth**
2. **Email Auth** 섹션
3. **"Enable email confirmations"** 체크 해제
4. **Save**

## 문제가 계속되면

1. Supabase 프로젝트가 **활성 상태**인지 확인
2. API 키를 **복사할 때 전체가 복사**되었는지 확인
3. `.env` 파일 저장 후 **서버 재시작** 했는지 확인
4. 브라우저 콘솔에서 **실제 에러 메시지** 확인

## 빠른 테스트 (커맨드라인)

다음 명령어로 API 키가 유효한지 즉시 확인:

```bash
curl "https://[your-project-ref].supabase.co/auth/v1/health" \
  -H "apikey: [your-anon-key]"
```

성공하면 빈 응답 또는 `{}` 반환
실패하면 `{"message":"Invalid API key"}` 반환
