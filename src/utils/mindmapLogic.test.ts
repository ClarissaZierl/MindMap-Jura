import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FIVE_DEFAULT_PRESETS,
  SAMPLE_DEEP_NESTED_TEMPLATES,
  addQuickChildNode,
  addQuickSiblingNode,
  buildNestedTree,
  createInitialMindMap,
  deleteNodeAndDescendants,
  deserializeMindMap,
  exportToMarkdown,
  getNextNodeByDirection,
  searchNodes,
  serializeMindMap,
  updateNodeAttributes,
} from './mindmapLogic';

test('5 defaults exist and cover bubble, box, triangle, diamond, and hexagon', () => {
  assert.equal(FIVE_DEFAULT_PRESETS.length, 5);
  const shapes = FIVE_DEFAULT_PRESETS.map((p) => p.shape);
  assert.deepEqual(shapes, ['bubble', 'box', 'triangle', 'diamond', 'hexagon']);
});

test('quick addition uses the currently active default preset and supports switching defaults', () => {
  let state = createInitialMindMap();
  // Default active preset is preset-bubble
  const firstAdd = addQuickChildNode(state, 'root', 'Quick Bubble Child');
  state = firstAdd.state;
  assert.equal(firstAdd.newNode.shape, 'bubble');
  assert.equal(firstAdd.newNode.bubbleColor, '#FFFFFF');
  assert.equal(firstAdd.newNode.textColor, '#0F172A');

  // Switch active default to Triangle preset
  state = { ...state, activeDefaultId: 'preset-triangle' };
  const secondAdd = addQuickChildNode(state, firstAdd.newNode.id, 'Quick Triangle Grandchild');
  state = secondAdd.state;
  assert.equal(secondAdd.newNode.shape, 'triangle');
  assert.equal(secondAdd.newNode.bubbleColor, '#FFE4E6');
  assert.equal(secondAdd.newNode.textColor, '#881337');

  // Switch active default to Box preset and add sibling
  state = { ...state, activeDefaultId: 'preset-box' };
  const siblingAdd = addQuickSiblingNode(state, secondAdd.newNode.id, 'Quick Box Sibling');
  assert.equal(siblingAdd.newNode.shape, 'box');
  assert.equal(siblingAdd.newNode.parentId, firstAdd.newNode.id);
  assert.equal(siblingAdd.newNode.bubbleColor, '#FEF3C7');
  assert.equal(siblingAdd.newNode.textColor, '#78350F');
});

test('bubble color and text color can be configured independently and persist across export/import', () => {
  let state = createInitialMindMap();
  state = updateNodeAttributes(state, 'node-research', {
    shape: 'triangle',
    bubbleColor: '#1E293B',
    textColor: '#38BDF8',
    text: 'Custom Styled Triangle',
  });

  const updated = state.nodes.find((n) => n.id === 'node-research')!;
  assert.equal(updated.shape, 'triangle');
  assert.equal(updated.bubbleColor, '#1E293B');
  assert.equal(updated.textColor, '#38BDF8');

  const json = serializeMindMap(state);
  const reimported = deserializeMindMap(json);
  const reimportedNode = reimported.nodes.find((n) => n.id === 'node-research')!;
  assert.equal(reimportedNode.shape, 'triangle');
  assert.equal(reimportedNode.bubbleColor, '#1E293B');
  assert.equal(reimportedNode.textColor, '#38BDF8');
  assert.equal(reimportedNode.text, 'Custom Styled Triangle');
});

test('deeply nested 6-level mind map exports and imports with 100% fidelity across all shapes and colors', () => {
  let state = createInitialMindMap();
  const shapes = ['bubble', 'box', 'triangle', 'diamond', 'hexagon'] as const;
  const bubbleColors = ['#FFFFFF', '#FEF3C7', '#FFE4E6', '#D1FAE5', '#E0E7FF'];
  const textColors = ['#0F172A', '#78350F', '#881337', '#064E3B', '#1E3A8A'];

  let parentId = 'root';
  for (let depth = 1; depth <= 5; depth++) {
    const res = addQuickChildNode(state, parentId, `Deep Level ${depth} Node`);
    state = updateNodeAttributes(res.state, res.newNode.id, {
      shape: shapes[depth - 1],
      bubbleColor: bubbleColors[depth - 1],
      textColor: textColors[depth - 1],
    });
    parentId = res.newNode.id;
  }

  const exportedJson = serializeMindMap(state);
  const parsedPayload = JSON.parse(exportedJson);
  assert.equal(parsedPayload.format, 'minimalmap-v1');
  assert.ok(Array.isArray(parsedPayload.tree));

  // Verify nested tree structure reaches depth 5
  const reimported = deserializeMindMap(exportedJson);
  assert.equal(reimported.nodes.length, state.nodes.length);

  // Verify the deepest node (Level 5) has full breadcrumb of length 6 (root + 5 levels)
  const matches = searchNodes(reimported.nodes, 'Deep Level 5');
  assert.equal(matches.length, 1);
  assert.equal(matches[0].depth, 5);
  assert.deepEqual(matches[0].breadcrumb, [
    'Product Strategy',
    'Deep Level 1 Node',
    'Deep Level 2 Node',
    'Deep Level 3 Node',
    'Deep Level 4 Node',
    'Deep Level 5 Node',
  ]);
  assert.equal(matches[0].node.shape, 'hexagon');
  assert.equal(matches[0].node.bubbleColor, '#E0E7FF');
  assert.equal(matches[0].node.textColor, '#1E3A8A');
});

test('importing nested-tree-only JSON without x/y coordinates automatically lays out all levels', () => {
  const sampleTemplate = SAMPLE_DEEP_NESTED_TEMPLATES[0].data;
  const imported = deserializeMindMap(JSON.stringify(sampleTemplate));

  assert.equal(imported.title, 'Distributed Cloud Engine (5-Level Nesting)');
  assert.equal(imported.activeDefaultId, 'preset-hexagon');
  assert.equal(imported.nodes.length, 10);

  // Verify Level 4 leaf node 'Redis Cluster Shard A' is properly linked and positioned
  const redisMatch = searchNodes(imported.nodes, 'redis shard');
  assert.equal(redisMatch.length, 1);
  assert.equal(redisMatch[0].depth, 4);
  assert.ok(redisMatch[0].node.x !== 0 || redisMatch[0].node.y !== 0);

  // Verify Markdown export includes nested hierarchy
  const md = exportToMarkdown(imported);
  assert.ok(md.includes('Global Edge Platform'));
  assert.ok(md.includes('        - **Redis Cluster Shard A**'));
});

test('case-insensitive search and subtree deletion work accurately', () => {
  const state = createInitialMindMap();
  const results = searchNodes(state.nodes, 'PAIN POINT');
  assert.equal(results.length, 1);
  assert.equal(results[0].node.id, 'node-synthesis');
  assert.deepEqual(results[0].breadcrumb, [
    'Product Strategy',
    'User Research',
    'Pain Point Matrix',
  ]);

  // Deleting 'node-research' removes it and its children ('node-interviews', 'node-synthesis')
  const afterDelete = deleteNodeAndDescendants(state, 'node-research');
  assert.equal(afterDelete.nodes.some((n) => n.id === 'node-research'), false);
  assert.equal(afterDelete.nodes.some((n) => n.id === 'node-interviews'), false);
  assert.equal(afterDelete.nodes.some((n) => n.id === 'node-synthesis'), false);

  // Directional navigation finds right child from root
  const rightId = getNextNodeByDirection(afterDelete.nodes, 'root', 'right');
  assert.ok(rightId === 'node-design' || rightId === 'node-launch');
});
