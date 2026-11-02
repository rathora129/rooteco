import prisma from '@/lib/prisma';

const normalizePhone = (phone) => String(phone || '').replace(/[^\d+]/g, '');

export async function upsertClientByContact({ name, company, email, phone, city }) {
  const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  const existing = await prisma.client.findFirst({
    where: {
      OR: [
        { phone: normalizedPhone },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ],
    },
  });

  if (existing) {
    return prisma.client.update({
      where: { id: existing.id },
      data: {
        name: name || existing.name,
        company: company || existing.company,
        email: normalizedEmail || existing.email,
        city: city || existing.city,
      },
    });
  }

  return prisma.client.create({
    data: {
      name: name || 'Website Enquiry',
      company: company || null,
      email: normalizedEmail,
      phone: normalizedPhone,
      city: city || null,
    },
  });
}

export async function recordLead({
  name,
  company,
  email,
  phone,
  city,
  source = 'website',
  productInterest,
  requirement,
  budget,
  status = 'new',
}) {
  const client = await upsertClientByContact({ name, company, email, phone, city });

  const existingLead = await prisma.lead.findFirst({
    where: {
      OR: [
        { phone: normalizePhone(phone) },
        ...(email ? [{ email: String(email).trim().toLowerCase() }] : []),
      ],
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existingLead) {
    return prisma.lead.update({
      where: { id: existingLead.id },
      data: {
        name: name || existingLead.name,
        company: company || existingLead.company,
        email: email || existingLead.email,
        city: city || existingLead.city,
        source,
        productInterest: productInterest || existingLead.productInterest,
        requirement: requirement || existingLead.requirement,
        budget: budget || existingLead.budget,
        status,
        clientId: client?.id || existingLead.clientId,
      },
    });
  }

  return prisma.lead.create({
    data: {
      name: name || 'Website Enquiry',
      company: company || null,
      email: email ? String(email).trim().toLowerCase() : null,
      phone: normalizePhone(phone) || phone,
      city: city || null,
      source,
      productInterest: productInterest || null,
      requirement: requirement || null,
      budget: budget || null,
      status,
      clientId: client?.id || null,
    },
  });
}

export function normalizePhoneNumber(phone) {
  return normalizePhone(phone);
}
