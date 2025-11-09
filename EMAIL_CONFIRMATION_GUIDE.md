# Supabase 이메일 확인 문제 해결 가이드

## 🚨 문제 증상

**에러**: `POST .../auth/v1/token?grant_type=password 400 (Bad Request)`

**원인**: Supabase는 기본적으로 회원가입 시 이메일 확인을 요구합니다. 이메일이 확인되지 않은 사용자는 로그인할 수 없습니다.

---

## ✅ 해결 방법

### 방법 1: 이메일 확인 비활성화 (개발 환경 권장) ⭐

개발 중에는 이메일 확인을 비활성화하여 빠르게 테스트할 수 있습니다.

#### 1단계: Supabase Dashboard 설정

1. **Supabase Dashboard 접속**
   - https://app.supabase.com
   - 프로젝트 선택

2. **Authentication > Providers > Email 이동**

3. **"Confirm email" 토글 OFF**
   - "Confirm email" 옵션을 **비활성화**
   - "Save" 클릭

   ![이미지 예시](https://supabase.com/docs/img/guides/auth/auth-confirm-email.png)

4. **완료!** 이제 이메일 확인 없이 바로 로그인 가능합니다.

#### 2단계: 기존 사용자 확인 처리 (선택)

이미 가입한 사용자가 있다면 수동으로 확인 처리해야 합니다:

**Supabase Dashboard > SQL Editor**에서 실행:

```sql
-- 모든 미확인 사용자를 확인 처리
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE
  email_confirmed_at IS NULL;
```

특정 사용자만 확인:
```sql
-- 특정 이메일만 확인 처리
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE
  email = 'your-email@example.com'
  AND email_confirmed_at IS NULL;
```

---

### 방법 2: 이메일 확인 링크 클릭 (프로덕션 권장)

프로덕션 환경에서는 이메일 확인을 유지하는 것이 보안상 좋습니다.

#### 설정 방법

1. **이메일 템플릿 설정**
   - Supabase Dashboard > Authentication > Email Templates
   - "Confirm signup" 템플릿 확인
   - Redirect URL 설정: `http://localhost:3000` (개발) 또는 `https://your-domain.com` (프로덕션)

2. **사용자 가입 플로우**
   ```
   사용자 회원가입
   → Supabase가 확인 이메일 발송
   → 사용자가 이메일 링크 클릭
   → 이메일 확인 완료
   → 로그인 가능
   ```

3. **로컬 개발 시 이메일 확인 링크 확인**
   - Supabase Dashboard > Authentication > Users
   - 사용자 클릭 > "Send confirmation email" 클릭
   - 또는 방법 1의 SQL로 수동 확인

---

### 방법 3: 개발 환경에서만 이메일 확인 스킵

코드에서 환경에 따라 이메일 확인을 선택적으로 처리할 수 있습니다.

**이미 적용됨**: `/frontend/src/supabase/auth.service.ts`

```typescript
// 회원가입 시 이메일 확인 스킵 (개발 환경용)
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name },
    emailRedirectTo: undefined, // 이메일 확인 스킵
  },
});
```

---

## 🔍 확인 방법

### 사용자 이메일 확인 상태 확인

**SQL Editor에서 실행**:

```sql
-- 모든 사용자의 이메일 확인 상태 확인
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

**결과 해석**:
- `email_confirmed_at`이 **NULL**: ❌ 미확인 (로그인 불가)
- `email_confirmed_at`이 **날짜**: ✅ 확인됨 (로그인 가능)

---

## 🛠️ 개선된 에러 처리

이제 로그인 실패 시 명확한 에러 메시지를 제공합니다:

### 에러 메시지 예시

#### 1. 이메일 미확인
```
❌ 이메일 확인이 필요합니다. 회원가입 시 받은 이메일을 확인하거나 관리자에게 문의하세요.
```

#### 2. 잘못된 자격 증명
```
❌ 이메일 또는 비밀번호가 올바르지 않습니다.
```

#### 3. 이미 가입된 이메일
```
❌ 이미 가입된 이메일입니다.
```

#### 4. 비밀번호 정책 위반
```
❌ 비밀번호는 최소 6자 이상이어야 합니다.
```

---

## 📋 체크리스트

### 개발 환경 설정

- [ ] Supabase Dashboard에서 "Confirm email" 비활성화
- [ ] 기존 사용자 SQL로 확인 처리
- [ ] 로그인 테스트

### 프로덕션 환경 설정

- [ ] "Confirm email" 활성화 유지
- [ ] 이메일 템플릿 설정
- [ ] Redirect URL 설정
- [ ] 테스트 회원가입 → 이메일 확인 → 로그인 플로우 테스트

---

## 🔧 추가 설정 (선택)

### SMTP 설정 (커스텀 이메일)

Supabase의 기본 이메일 대신 자신의 SMTP 서버를 사용할 수 있습니다:

1. **Supabase Dashboard > Settings > Auth > SMTP Settings**
2. **Enable Custom SMTP** 활성화
3. SMTP 서버 정보 입력:
   - Host: `smtp.gmail.com` (Gmail 예시)
   - Port: `587`
   - Username: `your-email@gmail.com`
   - Password: `your-app-password`
   - Sender email: `noreply@your-domain.com`

### 이메일 템플릿 커스터마이징

1. **Authentication > Email Templates**
2. 템플릿 선택 (Confirm signup, Magic Link 등)
3. HTML/텍스트 수정
4. 변수 사용:
   - `{{ .ConfirmationURL }}` - 확인 링크
   - `{{ .Token }}` - 확인 토큰
   - `{{ .SiteURL }}` - 사이트 URL

---

## 🐛 트러블슈팅

### 문제 1: 설정 변경 후에도 400 에러 발생

**해결**:
1. 브라우저 캐시 삭제
2. localStorage 초기화:
   ```javascript
   localStorage.clear();
   ```
3. 페이지 새로고침
4. 기존 사용자 SQL로 확인 처리

### 문제 2: 이메일을 받지 못함

**해결**:
1. 스팸 폴더 확인
2. SMTP 설정 확인 (커스텀 SMTP 사용 시)
3. Supabase Dashboard > Logs에서 에러 확인
4. 개발 환경에서는 SQL로 수동 확인 추천

### 문제 3: 환경변수가 인식되지 않음

**해결**:
```bash
# .env 파일 확인
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# 서버 재시작
npm start
```

---

## 📚 참고 자료

- [Supabase Auth 공식 문서](https://supabase.com/docs/guides/auth)
- [이메일 확인 설정](https://supabase.com/docs/guides/auth/auth-email)
- [SMTP 설정 가이드](https://supabase.com/docs/guides/auth/auth-smtp)

---

## 요약

### 빠른 해결 (개발 환경)

```sql
-- 1. Supabase Dashboard에서 "Confirm email" OFF

-- 2. SQL Editor에서 실행
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. 로그인 테스트 ✅
```

### 권장 설정 (프로덕션)

- ✅ "Confirm email" 활성화 유지
- ✅ 이메일 템플릿 커스터마이징
- ✅ SMTP 설정 (선택)
- ✅ 사용자에게 확인 이메일 안내

문제가 해결되지 않으면 브라우저 콘솔의 전체 에러 로그를 확인하거나, Supabase Dashboard > Logs를 확인하세요.
