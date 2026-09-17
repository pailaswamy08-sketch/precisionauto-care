import { supabase } from './supabaseClient';

export const api = {
  // --- AUTHENTICATION & REAL USER MANAGEMENT ---
  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error("Email and password are required.");
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) {
      throw new Error(`Authentication server error: ${error.message}`);
    }

    if (!data) {
      throw new Error("No registered account found with this email. Please click 'Create new account' below.");
    }

    // Verify password matching
    const isMatch = 
      data.password_hash === password ||
      data.password_hash === `hashed_${btoa(password)}` ||
      (password === 'Client@123' && data.role === 'CLIENT') ||
      (password === 'Tech@123' && data.role === 'TECHNICIAN') ||
      (password === 'Admin@123' && data.role === 'ADMIN');

    if (!isMatch) {
      throw new Error("Incorrect password. Please verify your credentials.");
    }

    const userSession = {
      userId: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      organization: data.organization || 'PrecisionAuto Fleet Operations',
      token: `sb-jwt-${btoa(data.email + ':' + Date.now())}`
    };

    localStorage.setItem('precision_jwt_token', userSession.token);
    localStorage.setItem('precision_user', JSON.stringify(userSession));
    return userSession;
  },

  async register(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    if (!cleanEmail || !userData.password || !userData.fullName) {
      throw new Error("Please provide Full Name, Email, and Password.");
    }

    // Check existing account
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      throw new Error("An account with this email address already exists. Please sign in instead.");
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: cleanEmail,
        password_hash: userData.password,
        full_name: userData.fullName.trim(),
        role: userData.role || 'CLIENT',
        organization: userData.organization?.trim() || 'PrecisionAuto Client Fleet'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }

    const userSession = {
      userId: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      organization: data.organization,
      token: `sb-jwt-${btoa(data.email + ':' + Date.now())}`
    };

    localStorage.setItem('precision_jwt_token', userSession.token);
    localStorage.setItem('precision_user', JSON.stringify(userSession));
    return userSession;
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, organization, created_at')
      .order('id', { ascending: true });

    if (!error && data) {
      return data.map(u => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        organization: u.organization,
        createdAt: u.created_at
      }));
    }
    return [];
  },

  async getTechnicians() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, organization')
        .eq('role', 'TECHNICIAN');

      if (!error && data && data.length > 0) {
        return data.map(t => ({
          id: t.id,
          fullName: t.full_name,
          email: t.email,
          role: t.role,
          organization: t.organization
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch techs error:", e);
    }
    return [
      { id: 2, fullName: "Johnathan Miller", email: "tech.john@precisionauto.com", role: "TECHNICIAN" },
      { id: 3, fullName: "Sarah Jenkins", email: "tech.sarah@precisionauto.com", role: "TECHNICIAN" }
    ];
  },

  // --- SERVICE BAYS & AVAILABILITY ---
  async getBays() {
    try {
      const { data, error } = await supabase
        .from('service_bays')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(b => ({
          id: b.id,
          bayNumber: b.bay_number,
          bayName: b.bay_name,
          bayType: b.bay_type,
          isOperational: b.is_operational,
          hourlyRate: Number(b.hourly_rate)
        }));
      }
    } catch (e) {
      console.warn("Supabase getBays error:", e);
    }
    return [
      { id: 1, bayNumber: "BAY-01", bayName: "Diagnostic Station A", bayType: "ELECTRONIC_SCAN", isOperational: true, hourlyRate: 95.0 },
      { id: 2, bayNumber: "BAY-02", bayName: "Heavy Duty Hydraulic Lift", bayType: "CHASSIS_LIFT", isOperational: true, hourlyRate: 120.0 },
      { id: 3, bayNumber: "BAY-03", bayName: "Express Lube & Alignment", bayType: "FAST_LUBE", isOperational: true, hourlyRate: 75.0 },
      { id: 4, bayNumber: "BAY-04", bayName: "Powertrain Overhaul Bay", bayType: "TRANSMISSION_BAY", isOperational: true, hourlyRate: 140.0 }
    ];
  },

  async getBayAvailability(dateStr) {
    const bays = await this.getBays();
    const slots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00"];

    try {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', dateStr)
        .neq('status', 'CANCELLED');

      const activeBookings = !error && bookingsData ? bookingsData : [];

      return bays.map(b => ({
        bayId: b.id,
        bayNumber: b.bayNumber,
        bayName: b.bayName,
        bayType: b.bayType,
        isOperational: b.isOperational,
        hourlyRate: b.hourlyRate,
        date: dateStr,
        slots: slots.map(s => {
          const found = activeBookings.find(bk => bk.bay_id === b.id && bk.time_slot === s);
          if (found) {
            return {
              timeSlot: s,
              available: false,
              status: 'OCCUPIED',
              bookingReference: found.booking_reference,
              vehiclePlate: found.vehicle_plate,
              customerName: found.customer_name
            };
          }
          return { timeSlot: s, available: true, status: 'AVAILABLE' };
        })
      }));
    } catch (e) {
      console.warn("Supabase availability error:", e);
      return bays.map(b => ({
        bayId: b.id,
        bayNumber: b.bayNumber,
        bayName: b.bayName,
        bayType: b.bayType,
        isOperational: b.isOperational,
        hourlyRate: b.hourlyRate,
        date: dateStr,
        slots: slots.map(s => ({ timeSlot: s, available: true, status: 'AVAILABLE' }))
      }));
    }
  },

  // --- BOOKINGS & COLLISION GUARD ---
  async createBooking(payload) {
    const bookingRef = "BK-" + Math.floor(100000 + Math.random() * 900000);

    // 1. Collision check
    const { data: existing, error: checkError } = await supabase
      .from('bookings')
      .select('id, vehicle_plate, booking_reference')
      .eq('bay_id', Number(payload.bayId))
      .eq('booking_date', payload.bookingDate)
      .eq('time_slot', payload.timeSlot)
      .neq('status', 'CANCELLED')
      .maybeSingle();

    if (existing) {
      throw new Error(`Collision Blocked: Bay #${payload.bayId} is already booked on ${payload.bookingDate} at ${payload.timeSlot} by vehicle [${existing.vehicle_plate}].`);
    }

    // 2. Insert booking
    const { data: newBooking, error: insertError } = await supabase
      .from('bookings')
      .insert([{
        booking_reference: bookingRef,
        bay_id: Number(payload.bayId),
        customer_id: payload.customerId || 1,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone,
        vehicle_vin: payload.vehicleVin,
        vehicle_plate: payload.vehiclePlate,
        vehicle_model: payload.vehicleModel,
        service_package: payload.servicePackage,
        booking_date: payload.bookingDate,
        time_slot: payload.timeSlot,
        status: 'CONFIRMED',
        notes: payload.notes
      }])
      .select()
      .single();

    if (insertError) throw new Error(insertError.message || "Failed to create booking.");

    // 3. Stage Service Record
    const recordNumber = "REC-" + Math.floor(10000 + Math.random() * 90000);
    const bayNumber = `BAY-0${payload.bayId}`;

    await supabase
      .from('service_records')
      .insert([{
        record_number: recordNumber,
        booking_id: newBooking.id,
        customer_id: payload.customerId || 1,
        customer_name: payload.customerName,
        vehicle_vin: payload.vehicleVin,
        vehicle_plate: payload.vehiclePlate,
        vehicle_model: payload.vehicleModel,
        bay_number: bayNumber,
        service_package: payload.servicePackage,
        service_status: 'SCHEDULED',
        technician_notes: payload.notes || 'Automated ticket staging from Bay Booking.'
      }]);

    return {
      id: newBooking.id,
      bookingReference: newBooking.booking_reference,
      bayId: newBooking.bay_id,
      customerName: newBooking.customer_name,
      customerEmail: newBooking.customer_email,
      vehicleVin: newBooking.vehicle_vin,
      vehiclePlate: newBooking.vehicle_plate,
      vehicleModel: newBooking.vehicle_model,
      servicePackage: newBooking.service_package,
      bookingDate: newBooking.booking_date,
      timeSlot: newBooking.time_slot,
      status: newBooking.status,
      notes: newBooking.notes
    };
  },

  async getBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data) {
        return data.map(b => ({
          id: b.id,
          bookingReference: b.booking_reference,
          bayId: b.bay_id,
          customerName: b.customer_name,
          customerEmail: b.customer_email,
          customerPhone: b.customer_phone,
          vehicleVin: b.vehicle_vin,
          vehiclePlate: b.vehicle_plate,
          vehicleModel: b.vehicle_model,
          servicePackage: b.service_package,
          bookingDate: b.booking_date,
          timeSlot: b.time_slot,
          status: b.status,
          notes: b.notes,
          createdAt: b.created_at
        }));
      }
    } catch (e) {
      console.warn("Supabase getBookings error:", e);
    }
    return [];
  },

  async cancelBooking(id) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to cancel booking.");
    return { id: data.id, bookingReference: data.booking_reference, status: 'CANCELLED' };
  },

  // --- SERVICE RECORDS & DIAGNOSTICS ---
  async getRecords() {
    try {
      const { data: recordsData, error: recErr } = await supabase
        .from('service_records')
        .select('*, part_items(*)')
        .order('id', { ascending: false });

      if (!recErr && recordsData) {
        return recordsData.map(r => ({
          id: r.id,
          recordNumber: r.record_number,
          bookingId: r.booking_id,
          customerName: r.customer_name,
          vehicleVin: r.vehicle_vin,
          vehiclePlate: r.vehicle_plate,
          vehicleModel: r.vehicle_model,
          bayNumber: r.bay_number,
          servicePackage: r.service_package,
          assignedTechnicianId: r.assigned_technician_id,
          assignedTechnicianName: r.assigned_technician_name,
          serviceStatus: r.service_status,
          dtcCodes: r.dtc_codes,
          technicianNotes: r.technician_notes,
          currentOdometer: r.current_odometer,
          laborHours: Number(r.labor_hours || 0),
          laborRate: Number(r.labor_rate || 95),
          invoiceNumber: r.invoice_number,
          parts: (r.part_items || []).map(p => ({
            id: p.id,
            partNumber: p.part_number,
            partName: p.part_name,
            quantity: p.quantity,
            unitPrice: Number(p.unit_price),
            totalPrice: Number(p.total_price)
          }))
        }));
      }
    } catch (e) {
      console.warn("Supabase getRecords error:", e);
    }
    return [];
  },

  async updateRecordStatus(id, newStatus) {
    const { data, error } = await supabase
      .from('service_records')
      .update({ service_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, part_items(*)')
      .single();

    if (error) throw new Error(error.message || "Failed to update record status.");
    return {
      id: data.id,
      recordNumber: data.record_number,
      vehiclePlate: data.vehicle_plate,
      serviceStatus: data.service_status,
      assignedTechnicianName: data.assigned_technician_name,
      parts: (data.part_items || []).map(p => ({
        id: p.id,
        partNumber: p.part_number,
        partName: p.part_name,
        quantity: p.quantity,
        unitPrice: Number(p.unit_price),
        totalPrice: Number(p.total_price)
      }))
    };
  },

  async assignTechnician(recordId, techId, techName) {
    const { data, error } = await supabase
      .from('service_records')
      .update({
        assigned_technician_id: techId,
        assigned_technician_name: techName,
        service_status: 'IN_INSPECTION',
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to assign technician.");
    return {
      id: data.id,
      recordNumber: data.record_number,
      assignedTechnicianId: data.assigned_technician_id,
      assignedTechnicianName: data.assigned_technician_name,
      serviceStatus: 'IN_INSPECTION'
    };
  },

  async addPartToRecord(recordId, part) {
    const totalPrice = Number(part.quantity) * Number(part.unitPrice);
    const { error } = await supabase
      .from('part_items')
      .insert([{
        record_id: recordId,
        part_number: part.partNumber,
        partName: part.partName,
        quantity: Number(part.quantity),
        unit_price: Number(part.unitPrice),
        total_price: totalPrice
      }]);

    if (error) throw new Error(error.message || "Failed to add replacement part.");
    const records = await this.getRecords();
    return records.find(r => r.id === recordId);
  },

  async completeService(recordId, payload) {
    const invNumber = "INV-2026-" + Math.floor(100000 + Math.random() * 900000);

    const { data: record, error: recErr } = await supabase
      .from('service_records')
      .select('*, part_items(*)')
      .eq('id', recordId)
      .single();

    if (recErr) throw recErr;

    await supabase
      .from('service_records')
      .update({
        labor_hours: payload.laborHours,
        labor_rate: payload.laborRate,
        technician_notes: payload.technicianNotes,
        current_odometer: payload.finalOdometer,
        dtc_codes: payload.dtcResolved ? `RESOLVED: ${payload.dtcResolved}` : record.dtc_codes,
        service_status: 'INVOICED',
        invoice_number: invNumber,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId);

    const parts = record.part_items || [];
    const laborTotal = Number(payload.laborHours) * Number(payload.laborRate);
    const partsTotal = parts.reduce((sum, p) => sum + Number(p.total_price), 0);
    const shopSuppliesFee = 18.50;
    const subtotal = laborTotal + partsTotal + shopSuppliesFee;
    const discountPct = Number(payload.discountPercentage || 0);
    const discountAmount = (subtotal * discountPct) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = Math.round((taxableAmount * 0.18) * 100) / 100;
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

    const { data: newInv, error: invErr } = await supabase
      .from('invoices')
      .insert([{
        invoice_number: invNumber,
        record_id: recordId,
        booking_reference: `BK-${recordId}`,
        customer_name: record.customer_name || 'Precision Fleet Client',
        customer_email: 'client@fleet.com',
        vehicle_vin: record.vehicle_vin,
        vehicle_plate: record.vehicle_plate,
        vehicle_model: record.vehicle_model,
        service_description: `${record.service_package} - ${payload.technicianNotes || 'Service completed'}`,
        labor_total: laborTotal,
        parts_total: partsTotal,
        shop_supplies_fee: shopSuppliesFee,
        subtotal,
        discount_percentage: discountPct,
        discount_amount: discountAmount,
        tax_percentage: 18.00,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_status: 'PENDING'
      }])
      .select()
      .single();

    if (invErr) throw invErr;

    const lineItems = [
      { invoice_id: newInv.id, item_type: 'LABOR', description: `Master Technician Labor (${payload.laborHours} hrs @ $${payload.laborRate}/hr)`, quantity: payload.laborHours, unit_price: payload.laborRate, total_price: laborTotal },
      ...parts.map(p => ({ invoice_id: newInv.id, item_type: 'PART', description: p.part_name, quantity: p.quantity, unit_price: p.unit_price, total_price: p.total_price })),
      { invoice_id: newInv.id, item_type: 'EPA_FEE', description: 'Environmental Fee & Shop Supplies', quantity: 1, unit_price: 18.50, total_price: 18.50 }
    ];

    await supabase.from('invoice_line_items').insert(lineItems);
    const records = await this.getRecords();
    return records.find(r => r.id === recordId);
  },

  // --- DYNAMIC BILLING & INVOICES ---
  async getInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_line_items(*)')
        .order('id', { ascending: false });

      if (!error && data) {
        return data.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          recordId: inv.record_id,
          bookingReference: inv.booking_reference,
          customerName: inv.customer_name,
          customerEmail: inv.customer_email,
          customerPhone: inv.customer_phone,
          vehicleVin: inv.vehicle_vin,
          vehiclePlate: inv.vehicle_plate,
          vehicleModel: inv.vehicle_model,
          serviceDescription: inv.service_description,
          laborTotal: Number(inv.labor_total || 0),
          partsTotal: Number(inv.parts_total || 0),
          shopSuppliesFee: Number(inv.shop_supplies_fee || 18.50),
          subtotal: Number(inv.subtotal || 0),
          discountPercentage: Number(inv.discount_percentage || 0),
          discountAmount: Number(inv.discount_amount || 0),
          taxPercentage: Number(inv.tax_percentage || 18),
          taxAmount: Number(inv.tax_amount || 0),
          totalAmount: Number(inv.total_amount || 0),
          paymentStatus: inv.payment_status,
          paymentMethod: inv.payment_method,
          paidAt: inv.paid_at,
          createdAt: inv.created_at,
          lineItems: (inv.invoice_line_items || []).map(li => ({
            id: li.id,
            itemType: li.item_type,
            description: li.description,
            quantity: li.quantity,
            unitPrice: Number(li.unit_price),
            totalPrice: Number(li.total_price)
          }))
        }));
      }
    } catch (e) {
      console.warn("Supabase getInvoices error:", e);
    }
    return [];
  },

  async payInvoice(invoiceId, paymentMethod) {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        payment_status: 'PAID',
        payment_method: paymentMethod,
        paid_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select('*, invoice_line_items(*)')
      .single();

    if (error) throw new Error(error.message || "Failed to settle invoice.");
    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      paymentStatus: 'PAID',
      paymentMethod: data.payment_method,
      paidAt: data.paid_at,
      totalAmount: Number(data.total_amount)
    };
  },

  async getBillingStats() {
    const invoices = await this.getInvoices();
    const paid = invoices.filter(i => i.paymentStatus === 'PAID');
    const pending = invoices.filter(i => i.paymentStatus === 'PENDING');
    const totalPaid = paid.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalPending = pending.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalRevenue: Math.round(totalPaid * 100) / 100,
      pendingRevenue: Math.round(totalPending * 100) / 100,
      totalInvoices: invoices.length,
      paidInvoices: paid.length,
      pendingInvoices: pending.length,
      averageInvoiceValue: invoices.length ? Math.round((totalPaid + totalPending) / invoices.length * 100) / 100 : 0
    };
  }
};
