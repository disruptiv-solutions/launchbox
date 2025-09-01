import { NextRequest, NextResponse } from 'next/server';
import { createTenant } from '../../../../lib/tenant-utils';
import { TenantSignupData } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { tenantData, ownerId } = body as {
      tenantData: TenantSignupData;
      ownerId: string;
    };

    if (!tenantData || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantData and ownerId' },
        { status: 400 }
      );
    }

    // Validate tenant data structure
    const requiredFields = ['companyName', 'subdomain', 'ownerName', 'ownerEmail'];
    for (const field of requiredFields) {
      if (!tenantData[field as keyof TenantSignupData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the tenant
    const tenantConfig = await createTenant(tenantData, ownerId);

    return NextResponse.json({
      success: true,
      tenant: tenantConfig,
      message: `Tenant ${tenantConfig.tenantId} created successfully`
    });

  } catch (error: any) {
    console.error('Error creating tenant:', error);
    
    // Handle specific errors
    if (error.message?.includes('reserved')) {
      return NextResponse.json(
        { error: 'This subdomain is reserved and cannot be used' },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('Invalid tenant ID')) {
      return NextResponse.json(
        { error: 'Invalid subdomain format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}