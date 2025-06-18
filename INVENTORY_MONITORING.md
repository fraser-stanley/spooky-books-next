# Inventory Monitoring & Maintenance Guide

## Automated Cleanup Systems

### Current Implementation
- **Stock Reservations**: 30-minute automatic expiration
- **Webhook Cleanup**: Stripe events trigger stock releases
- **Manual Cleanup**: `/api/cleanup-reserved-fields` for maintenance

### Monitoring Tools

1. **Debug Page**: `/debug`
   - Real-time stock calculations
   - Reserved vs available stock breakdown
   - Variant-level details for apparel

2. **Inventory Health API**: `/api/inventory-health`
   - System health monitoring
   - Cleanup trigger capabilities
   - Overselling detection

3. **Rate Limit Stats**: `/api/rate-limit-stats`
   - Monitor checkout attempt patterns
   - Detect potential issues

## Common Issues & Solutions

### Issue: Items Show Sold Out Despite Sanity Stock
**Symptoms**: Frontend shows "SOLD OUT" but Sanity shows stock > 0
**Cause**: Stale `reservedQuantity` values
**Solution**: 
```bash
curl -X POST /api/cleanup-reserved-fields
```

### Issue: Stock Not Updating After Sanity Changes
**Symptoms**: Changed stock in Sanity but frontend doesn't reflect
**Cause**: Cache not invalidated
**Solution**:
1. Check webhook configuration in Sanity Studio
2. Manually trigger revalidation:
```bash
curl -X POST /api/revalidate -d '{"_type":"product","_id":"product-id"}'
```

### Issue: Overselling Prevention
**System**: Atomic transactions prevent race conditions
**Monitoring**: Check `/api/inventory-monitor` for alerts

## Maintenance Schedule

### Daily (Automated)
- Expired reservation cleanup
- Stock validation checks

### Weekly (Manual)
- Review debug page for anomalies
- Check rate limit statistics
- Verify webhook functionality

### Monthly (Manual)
- Run full stock audit
- Clean up orphaned reservation documents
- Review and optimize stock thresholds

## Emergency Procedures

### Stock Discrepancy Found
1. Access debug page: `/debug`
2. Identify affected products
3. Run cleanup: `/api/cleanup-reserved-fields`
4. Verify fix in debug page
5. If issues persist, check Sanity Studio directly

### Webhook Failures
1. Check Vercel function logs
2. Verify webhook URLs in Sanity Studio
3. Test webhook manually
4. Revalidate affected pages

### Performance Issues
1. Check rate limit stats
2. Monitor inventory health API
3. Review checkout flow performance
4. Adjust rate limits if needed