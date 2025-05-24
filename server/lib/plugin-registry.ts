import { EventEmitter } from 'events';
import { db } from '../db';
import { plugins, tenantPlugins, tenants } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { Plugin, TenantPlugin, Tenant } from '@shared/schema';

export interface PluginInterface {
  name: string;
  version: string;
  category: 'investment' | 'analytics' | 'payment' | 'notification' | 'reporting';
  
  // Lifecycle methods
  onInstall?(tenantId: number, config?: any): Promise<void>;
  onUninstall?(tenantId: number): Promise<void>;
  onEnable?(tenantId: number, config?: any): Promise<void>;
  onDisable?(tenantId: number): Promise<void>;
  onConfigUpdate?(tenantId: number, newConfig: any): Promise<void>;
  
  // Feature methods
  getRoutes?(): PluginRoute[];
  getComponents?(): PluginComponent[];
  getHooks?(): PluginHook[];
  getMenuItems?(): PluginMenuItem[];
  getPermissions?(): string[];
  
  // Validation
  validateConfig?(config: any): boolean;
  getDependencies?(): string[];
}

export interface PluginRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: (req: any, res: any, next: any) => void;
  permissions?: string[];
  middleware?: string[];
}

export interface PluginComponent {
  name: string;
  type: 'page' | 'widget' | 'modal' | 'sidebar';
  component: React.ComponentType<any>;
  props?: any;
  permissions?: string[];
}

export interface PluginHook {
  name: string;
  type: 'before' | 'after' | 'filter';
  target: string; // e.g., 'user.create', 'investment.update'
  handler: (data: any, context: any) => Promise<any>;
}

export interface PluginMenuItem {
  label: string;
  icon?: string;
  path: string;
  permissions?: string[];
  children?: PluginMenuItem[];
}

class PluginRegistry extends EventEmitter {
  private plugins: Map<string, PluginInterface> = new Map();
  private tenantConfigs: Map<string, Map<string, any>> = new Map();
  
  constructor() {
    super();
    this.loadPluginsFromDatabase();
  }

  /**
   * Register a plugin with the registry
   */
  async registerPlugin(plugin: PluginInterface): Promise<void> {
    const pluginKey = `${plugin.name}@${plugin.version}`;
    
    // Validate plugin structure
    if (!this.validatePlugin(plugin)) {
      throw new Error(`Plugin ${pluginKey} failed validation`);
    }

    // Check dependencies
    const missingDeps = this.checkDependencies(plugin);
    if (missingDeps.length > 0) {
      throw new Error(`Plugin ${pluginKey} missing dependencies: ${missingDeps.join(', ')}`);
    }

    // Store plugin in database
    await db.insert(plugins).values({
      name: plugin.name,
      version: plugin.version,
      description: `${plugin.name} plugin`,
      category: plugin.category,
      entryPoint: pluginKey,
      dependencies: plugin.getDependencies?.() || [],
      config: {
        permissions: plugin.getPermissions?.() || [],
        routes: plugin.getRoutes?.().map(r => r.path) || [],
        components: plugin.getComponents?.().map(c => c.name) || [],
        hooks: plugin.getHooks?.().map(h => h.name) || [],
        apis: [],
      },
    }).onConflictDoUpdate({
      target: plugins.name,
      set: {
        version: plugin.version,
        updatedAt: new Date(),
      },
    });

    // Register in memory
    this.plugins.set(pluginKey, plugin);
    
    this.emit('pluginRegistered', { plugin: pluginKey });
    console.log(`✅ Plugin registered: ${pluginKey}`);
  }

  /**
   * Enable a plugin for a specific tenant
   */
  async enablePluginForTenant(
    tenantId: number, 
    pluginName: string, 
    config?: any
  ): Promise<void> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    // Get plugin from database
    const [dbPlugin] = await db
      .select()
      .from(plugins)
      .where(eq(plugins.name, pluginName));

    if (!dbPlugin) {
      throw new Error(`Plugin ${pluginName} not found in database`);
    }

    // Check if already enabled
    const existing = await db
      .select()
      .from(tenantPlugins)
      .where(
        and(
          eq(tenantPlugins.tenantId, tenantId),
          eq(tenantPlugins.pluginId, dbPlugin.id)
        )
      );

    if (existing.length > 0) {
      // Update configuration
      await db
        .update(tenantPlugins)
        .set({ 
          config,
          isEnabled: true,
          enabledAt: new Date(),
        })
        .where(eq(tenantPlugins.id, existing[0].id));
    } else {
      // Insert new record
      await db.insert(tenantPlugins).values({
        tenantId,
        pluginId: dbPlugin.id,
        config,
        isEnabled: true,
      });
    }

    // Store tenant config in memory
    const tenantKey = tenantId.toString();
    if (!this.tenantConfigs.has(tenantKey)) {
      this.tenantConfigs.set(tenantKey, new Map());
    }
    this.tenantConfigs.get(tenantKey)!.set(pluginName, config);

    // Call plugin's onEnable method
    if (plugin.onEnable) {
      await plugin.onEnable(tenantId, config);
    }

    this.emit('pluginEnabled', { tenantId, plugin: pluginName, config });
    console.log(`✅ Plugin ${pluginName} enabled for tenant ${tenantId}`);
  }

  /**
   * Disable a plugin for a specific tenant
   */
  async disablePluginForTenant(tenantId: number, pluginName: string): Promise<void> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    // Get plugin from database
    const [dbPlugin] = await db
      .select()
      .from(plugins)
      .where(eq(plugins.name, pluginName));

    if (dbPlugin) {
      await db
        .update(tenantPlugins)
        .set({ isEnabled: false })
        .where(
          and(
            eq(tenantPlugins.tenantId, tenantId),
            eq(tenantPlugins.pluginId, dbPlugin.id)
          )
        );
    }

    // Remove from memory
    const tenantKey = tenantId.toString();
    this.tenantConfigs.get(tenantKey)?.delete(pluginName);

    // Call plugin's onDisable method
    if (plugin.onDisable) {
      await plugin.onDisable(tenantId);
    }

    this.emit('pluginDisabled', { tenantId, plugin: pluginName });
    console.log(`🔴 Plugin ${pluginName} disabled for tenant ${tenantId}`);
  }

  /**
   * Get enabled plugins for a tenant
   */
  async getEnabledPluginsForTenant(tenantId: number): Promise<PluginInterface[]> {
    const enabledPlugins = await db
      .select({
        plugin: plugins,
        tenantPlugin: tenantPlugins,
      })
      .from(tenantPlugins)
      .innerJoin(plugins, eq(plugins.id, tenantPlugins.pluginId))
      .where(
        and(
          eq(tenantPlugins.tenantId, tenantId),
          eq(tenantPlugins.isEnabled, true)
        )
      );

    return enabledPlugins
      .map(({ plugin }) => this.getPlugin(plugin.name))
      .filter((plugin): plugin is PluginInterface => plugin !== undefined);
  }

  /**
   * Get plugin configuration for a tenant
   */
  getPluginConfigForTenant(tenantId: number, pluginName: string): any {
    const tenantKey = tenantId.toString();
    return this.tenantConfigs.get(tenantKey)?.get(pluginName);
  }

  /**
   * Update plugin configuration for a tenant
   */
  async updatePluginConfigForTenant(
    tenantId: number, 
    pluginName: string, 
    config: any
  ): Promise<void> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    // Validate configuration
    if (plugin.validateConfig && !plugin.validateConfig(config)) {
      throw new Error(`Invalid configuration for plugin ${pluginName}`);
    }

    // Update in database
    const [dbPlugin] = await db
      .select()
      .from(plugins)
      .where(eq(plugins.name, pluginName));

    if (dbPlugin) {
      await db
        .update(tenantPlugins)
        .set({ config })
        .where(
          and(
            eq(tenantPlugins.tenantId, tenantId),
            eq(tenantPlugins.pluginId, dbPlugin.id)
          )
        );
    }

    // Update in memory
    const tenantKey = tenantId.toString();
    if (!this.tenantConfigs.has(tenantKey)) {
      this.tenantConfigs.set(tenantKey, new Map());
    }
    this.tenantConfigs.get(tenantKey)!.set(pluginName, config);

    // Call plugin's onConfigUpdate method
    if (plugin.onConfigUpdate) {
      await plugin.onConfigUpdate(tenantId, config);
    }

    this.emit('pluginConfigUpdated', { tenantId, plugin: pluginName, config });
  }

  /**
   * Get all available plugins
   */
  getAvailablePlugins(): PluginInterface[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a specific plugin by name
   */
  getPlugin(name: string): PluginInterface | undefined {
    // Try exact match first
    const exactMatch = Array.from(this.plugins.entries())
      .find(([key, plugin]) => plugin.name === name);
    
    if (exactMatch) {
      return exactMatch[1];
    }

    // Try partial match (latest version)
    const partialMatches = Array.from(this.plugins.entries())
      .filter(([key, plugin]) => plugin.name === name)
      .sort(([a], [b]) => b.localeCompare(a)); // Sort by version desc
    
    return partialMatches[0]?.[1];
  }

  /**
   * Get all routes from enabled plugins for a tenant
   */
  async getRoutesForTenant(tenantId: number): Promise<PluginRoute[]> {
    const enabledPlugins = await this.getEnabledPluginsForTenant(tenantId);
    const routes: PluginRoute[] = [];

    for (const plugin of enabledPlugins) {
      if (plugin.getRoutes) {
        routes.push(...plugin.getRoutes());
      }
    }

    return routes;
  }

  /**
   * Get all components from enabled plugins for a tenant
   */
  async getComponentsForTenant(tenantId: number): Promise<PluginComponent[]> {
    const enabledPlugins = await this.getEnabledPluginsForTenant(tenantId);
    const components: PluginComponent[] = [];

    for (const plugin of enabledPlugins) {
      if (plugin.getComponents) {
        components.push(...plugin.getComponents());
      }
    }

    return components;
  }

  /**
   * Execute hooks for a specific event
   */
  async executeHooks(
    tenantId: number, 
    hookName: string, 
    data: any, 
    context: any = {}
  ): Promise<any> {
    const enabledPlugins = await this.getEnabledPluginsForTenant(tenantId);
    let result = data;

    for (const plugin of enabledPlugins) {
      if (plugin.getHooks) {
        const hooks = plugin.getHooks().filter(h => h.name === hookName);
        
        for (const hook of hooks) {
          if (hook.type === 'before' || hook.type === 'filter') {
            result = await hook.handler(result, context);
          } else if (hook.type === 'after') {
            await hook.handler(result, context);
          }
        }
      }
    }

    return result;
  }

  private validatePlugin(plugin: PluginInterface): boolean {
    return !!(
      plugin.name &&
      plugin.version &&
      plugin.category &&
      ['investment', 'analytics', 'payment', 'notification', 'reporting'].includes(plugin.category)
    );
  }

  private checkDependencies(plugin: PluginInterface): string[] {
    const dependencies = plugin.getDependencies?.() || [];
    const missing: string[] = [];

    for (const dep of dependencies) {
      if (!this.plugins.has(dep)) {
        missing.push(dep);
      }
    }

    return missing;
  }

  private async loadPluginsFromDatabase(): Promise<void> {
    try {
      // This would load tenant configurations from database
      const tenantPluginConfigs = await db
        .select({
          tenantId: tenantPlugins.tenantId,
          pluginName: plugins.name,
          config: tenantPlugins.config,
          isEnabled: tenantPlugins.isEnabled,
        })
        .from(tenantPlugins)
        .innerJoin(plugins, eq(plugins.id, tenantPlugins.pluginId))
        .where(eq(tenantPlugins.isEnabled, true));

      for (const config of tenantPluginConfigs) {
        const tenantKey = config.tenantId.toString();
        if (!this.tenantConfigs.has(tenantKey)) {
          this.tenantConfigs.set(tenantKey, new Map());
        }
        this.tenantConfigs.get(tenantKey)!.set(config.pluginName, config.config);
      }

      console.log(`📦 Loaded ${tenantPluginConfigs.length} plugin configurations from database`);
    } catch (error) {
      console.error('Failed to load plugin configurations:', error);
    }
  }
}

// Export singleton instance
export const pluginRegistry = new PluginRegistry();

// Export types and interfaces for plugin development
export type { PluginInterface, PluginRoute, PluginComponent, PluginHook, PluginMenuItem };