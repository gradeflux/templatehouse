# TemplateAllFlix CLAUDE.md

## 프로젝트 개요
- **이름**: TemplateAllFlix (템플릿올플릭스)
- **도메인**: templateallflix.com
- **타겟**: 해외 사용자 (영어권)
- **통화**: USD
- **서버 경로**: `/home/myuser/projects/templateallflix`

## 기술 스택
- **프레임워크**: Next.js 16 (App Router)
- **DB**: PostgreSQL (Docker, port 5434) + Prisma v5
- **Auth**: NextAuth.js v5 (Google + Kakao)
- **결제**: PayPal SDK (건별 + 구독)
- **스토리지**: MinIO (로컬 S3 호환) 또는 Supabase Storage
- **이메일**: Resend
- **알림**: Telegram Bot

## 실행
```bash
cd /home/myuser/projects/templateallflix
docker compose up -d          # DB + Redis
npm run dev                   # 개발 서버 (port 3001)
```

## DB
```bash
DATABASE_URL=postgresql://templatehouse:th_secret_2026@localhost:5434/templatehouse
npx prisma studio             # DB GUI
node prisma/seed.mjs          # 시딩
```

## 주요 경로
| 경로 | 설명 |
|------|------|
| `/` | 홈 (템플릿 목록) |
| `/dashboard` | 마이페이지 (구매내역) |
| `/dashboard/subscription` | 구독 관리 |
| `/admin` | 어드민 대시보드 |
| `/admin/templates` | 템플릿 업로드/관리 |
| `/auth/signin` | 로그인 |
| `/api/payment/prepare` | PayPal 주문 생성 |
| `/api/payment/confirm` | PayPal 결제 확인 |
| `/api/payment/subscription` | PayPal 구독 |
| `/api/download/[id]` | Signed URL 다운로드 |

## 크레덴셜
`/home/myuser/Obsidian/Vault/Knowledge/credentials/templatehouse.md` 참조

## 배포
Cloudflare Tunnel → templateallflix.com → localhost:3001

## 주의사항
- `.env` 파일 절대 커밋 금지
- PortOne 코드 없음 → PayPal만 사용
- 통화 USD, 영어 UI 기준
