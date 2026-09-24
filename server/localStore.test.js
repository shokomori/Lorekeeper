import test from 'node:test'
import assert from 'node:assert/strict'

import { createUser, listCampaigns, createCampaign } from './localStore.js'

test('creates users and lists campaigns in the local store', async () => {
  const user = await createUser({
    name: 'Test DM',
    email: 'dm@example.com',
    passwordHash: 'pass',
  })

  assert.equal(user.email, 'dm@example.com')

  const campaign = await createCampaign({
    userId: user.id,
    name: 'Test Campaign',
    description: 'A test story',
  })

  const campaigns = await listCampaigns(user.id)
  assert.equal(campaigns.some((item) => item.id === campaign.id), true)
})
