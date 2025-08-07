/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import { NextRequest, NextResponse } from 'next/server'
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

import config from '../../../../payload.config'

export const GET = (request: NextRequest) => REST_GET(request, { config })
export const POST = (request: NextRequest) => REST_POST(request, { config })
export const DELETE = (request: NextRequest) => REST_DELETE(request, { config })
export const PATCH = (request: NextRequest) => REST_PATCH(request, { config })