"use server";
import { headers } from "next/headers";

/**
 * 서버 사이드에서 프록시 접근을 감지하는 함수
 * 미들웨어에서 설정한 헤더를 체크합니다.
 */
export async function isProxyAccess(): Promise<boolean> {
  try {
    const headersList = await headers();
    
    // 미들웨어에서 설정한 프록시 헤더 체크
    const proxyHeader = headersList.get('x-proxy-access');
    
    return proxyHeader === 'true';
  } catch (error) {
    console.warn('Failed to detect proxy access:', error);
    return false;
  }
}

/**
 * 서버에서 프록시 도메인 정보를 가져오는 함수 (옵션)
 */
export async function getProxyDomain(): Promise<string | null> {
  try {
    const headersList = await headers();
    const proxyDomain = headersList.get('x-proxy-domain');
    
    return proxyDomain || null;
  } catch (error) {
    console.warn('Failed to get proxy domain:', error);
    return null;
  }
}
