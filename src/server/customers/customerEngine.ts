import { CustomerAccount } from '../../types/omega.ts';
import { db } from '../db.ts';

export class CustomerAndGrowthEngine {
  private customers: CustomerAccount[] = [];

  public getCustomers(): CustomerAccount[] {
    return this.customers;
  }

  public registerCustomer(publicKey?: string, tier: CustomerAccount['tier'] = 'FREE_TRIAL'): CustomerAccount {
    const cust: CustomerAccount = {
      customerId: `CUST-${Date.now().toString(36).toUpperCase()}`,
      publicKey,
      tier,
      signupTimestamp: Date.now(),
      lastActiveTimestamp: Date.now(),
      lifetimeSpendSol: 0,
      activeSubscriptions: [],
      totalApiCalls: 0,
      status: 'ACTIVE'
    };
    this.customers.push(cust);
    db.logAudit('INFO', 'CUSTOMER_ENGINE', `New customer onboarded: ${cust.customerId} [${tier}]`);
    return cust;
  }
}

export const customerEngine = new CustomerAndGrowthEngine();
