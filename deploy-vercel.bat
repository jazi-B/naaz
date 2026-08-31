@echo off
echo ====================================================
echo   Deploying NAAZ Next.js Storefront to Vercel...
echo ====================================================
cd storefront
npx vercel --prod
pause
