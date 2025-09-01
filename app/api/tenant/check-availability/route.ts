import { NextRequest, NextResponse } from 'next/server';
import { isValidTenantId, isReservedSubdomain } from '../../../../lib/tenant-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    console.log(`🌐 API: Checking subdomain availability for: ${subdomain}`);

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain parameter is required' },
        { status: 400 }
      );
    }

    // Validate format first
    if (!isValidTenantId(subdomain)) {
      console.log(`❌ API: Invalid subdomain format: ${subdomain}`);
      return NextResponse.json({
        subdomain,
        available: false,
        message: 'Invalid subdomain format'
      });
    }

    // Check if reserved
    if (isReservedSubdomain(subdomain)) {
      console.log(`❌ API: Subdomain is reserved: ${subdomain}`);
      return NextResponse.json({
        subdomain,
        available: false,
        message: 'Subdomain is reserved'
      });
    }

    // For now, let's assume all valid, non-reserved subdomains are available
    // This is a temporary solution for testing the signup flow
    // In production, you'd want to check against the database
    console.log(`✅ API: Subdomain appears available: ${subdomain}`);
    
    // Simple check - if it's a common name, say it's taken for testing
    const commonNames = ['admin', 'api', 'www', 'test', 'demo', 'app'];
    const isAvailable = !commonNames.includes(subdomain.toLowerCase());
    
    console.log(`🔍 API: Availability check result for "${subdomain}": ${isAvailable}`);

    return NextResponse.json({
      subdomain,
      available: isAvailable,
      message: isAvailable 
        ? 'Subdomain is available' 
        : 'Subdomain is already taken'
    });
  } catch (error) {
    console.error('❌ API: Error checking subdomain availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}