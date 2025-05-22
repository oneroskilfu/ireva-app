import type { PluginInterface, PluginRoute, PluginComponent, PluginHook } from '../lib/plugin-registry';
import { db } from '../db';
import { investments, properties, transactions } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class CryptoInvestmentPlugin implements PluginInterface {
  name = 'crypto-investment';
  version = '1.0.0';
  category = 'investment' as const;

  async onEnable(tenantId: number, config?: any): Promise<void> {
    console.log(`🚀 Crypto Investment Plugin enabled for tenant ${tenantId}`);
    
    // Initialize crypto-specific settings
    if (config?.autoSync) {
      console.log('📈 Setting up crypto price synchronization');
    }
  }

  async onDisable(tenantId: number): Promise<void> {
    console.log(`🔴 Crypto Investment Plugin disabled for tenant ${tenantId}`);
  }

  async onConfigUpdate(tenantId: number, newConfig: any): Promise<void> {
    console.log(`⚙️ Crypto Investment Plugin config updated for tenant ${tenantId}`, newConfig);
  }

  getRoutes(): PluginRoute[] {
    return [
      {
        path: '/api/crypto/prices',
        method: 'GET',
        handler: async (req, res) => {
          // Real-time crypto price integration point
          const cryptoPrices = {
            bitcoin: { price: 45000, change24h: 2.5 },
            ethereum: { price: 3200, change24h: -1.2 },
            cardano: { price: 0.65, change24h: 5.8 },
          };
          res.json(cryptoPrices);
        },
        permissions: ['crypto.view'],
      },
      {
        path: '/api/crypto/portfolios/:userId',
        method: 'GET',
        handler: async (req, res) => {
          const userId = parseInt(req.params.userId);
          
          const cryptoInvestments = await db
            .select({
              investment: investments,
              property: properties,
            })
            .from(investments)
            .innerJoin(properties, eq(properties.id, investments.propertyId))
            .where(eq(investments.userId, userId));

          const portfolio = {
            totalValue: cryptoInvestments.reduce((sum, inv) => sum + parseFloat(inv.investment.amount), 0),
            investments: cryptoInvestments.map(inv => ({
              id: inv.investment.id,
              cryptoSymbol: inv.property.name.toLowerCase(),
              amount: parseFloat(inv.investment.amount),
              shares: parseFloat(inv.investment.sharesCount || '0'),
              investmentDate: inv.investment.investmentDate,
            })),
          };

          res.json(portfolio);
        },
        permissions: ['crypto.view'],
      },
    ];
  }

  getComponents(): PluginComponent[] {
    return [
      {
        name: 'CryptoPortfolioWidget',
        type: 'widget',
        component: {} as any,
        permissions: ['crypto.view'],
      },
    ];
  }

  getHooks(): PluginHook[] {
    return [
      {
        name: 'investment.create',
        type: 'after',
        target: 'investment.create',
        handler: async (data, context) => {
          if (data.propertyType === 'cryptocurrency') {
            console.log(`📧 Sending crypto investment confirmation for ${data.amount}`);
          }
          return data;
        },
      },
    ];
  }

  getMenuItems() {
    return [
      {
        label: 'Crypto Investments',
        icon: 'bitcoin',
        path: '/crypto-portfolio',
        permissions: ['crypto.view'],
      },
    ];
  }

  getPermissions(): string[] {
    return ['crypto.view', 'crypto.invest', 'crypto.withdraw'];
  }

  validateConfig(config: any): boolean {
    return !!(config && typeof config.autoSync === 'boolean');
  }

  getDependencies(): string[] {
    return [];
  }
}