# Supabase 설정 가이드

## 회원가입이 안 되는 문제 해결

회원가입 후 로그인이 안 되거나 "이메일 확인 필요" 에러가 발생하면 다음을 확인하세요.

### 1. Supabase Dashboard에서 이메일 확인 비활성화

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Authentication** → **Settings** → **Auth** 탭
4. **Email Auth** 섹션 찾기
5. **"Enable email confirmations"** 체크 해제 (끄기)
6. **Save** 클릭

이 설정을 끄면:
- ✅ 회원가입 후 즉시 로그인 가능
- ✅ 이메일 확인 불필요
- ✅ 더 나은 사용자 경험

### 2. Email Templates 설정 (선택사항)

만약 이메일 확인을 활성화하고 싶다면:

1. **Authentication** → **Email Templates**
2. **Confirm signup** 템플릿 수정
3. Redirect URL을 프론트엔드 URL로 설정

### 3. Site URL 설정

1. **Authentication** → **URL Configuration**
2. **Site URL** 입력:
   - 로컬 개발: `http://localhost:3000`
   - 프로덕션: `https://your-domain.vercel.app`
3. **Redirect URLs** 추가:
   - `http://localhost:3000/**`
   - `https://your-domain.vercel.app/**`

### 4. Database 설정 확인

다음 테이블과 RLS 정책이 필요합니다:

#### user_profiles 테이블
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
```

#### RLS 정책
```sql
-- user_profiles RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Auto-create profile trigger
```sql
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

## 문제 해결 체크리스트

회원가입이 안 될 때 확인할 사항:

- [ ] Supabase URL과 Anon Key가 Vercel 환경 변수에 설정되어 있는가?
- [ ] "Enable email confirmations"가 비활성화되어 있는가?
- [ ] Site URL이 올바르게 설정되어 있는가?
- [ ] user_profiles 테이블과 trigger가 생성되어 있는가?
- [ ] RLS 정책이 활성화되어 있는가?
- [ ] 브라우저 콘솔에서 실제 에러 메시지 확인

## 테스트 방법

1. 개발자 도구 열기 (F12)
2. Console 탭 확인
3. 회원가입 시도
4. 콘솔에 출력되는 에러 메시지 확인:
   - `✅ 회원가입 성공` - 정상
   - `❌ Supabase 회원가입 에러` - Supabase 설정 문제
   - `이미 가입된 이메일입니다` - 다른 이메일 사용
   - `이메일 확인 필요` - Email confirmations 비활성화 필요

## Google OAuth 설정 (선택사항)

Google 로그인을 활성화하려면:

1. **GCP (Google Cloud Platform) 설정**
   - https://console.cloud.google.com
   - OAuth 2.0 클라이언트 ID 생성
   - 승인된 리디렉션 URI: `https://<project-ref>.supabase.co/auth/v1/callback`

2. **Supabase 설정**
   - **Authentication** → **Providers** → **Google**
   - **Enable** 체크
   - GCP에서 받은 Client ID와 Client Secret 입력
   - **Save**

## 도움이 필요하면

- Supabase 공식 문서: https://supabase.com/docs/guides/auth
- GitHub Issues: https://github.com/leaf468/SchoolActivity/issues
