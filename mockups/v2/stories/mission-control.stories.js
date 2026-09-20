import { expect, waitFor, userEvent } from 'storybook/test';
import { view } from '../../stories/_view.js';
export default {
  title: 'Oxagen V2/Mission Control',
  parameters: { layout: 'fullscreen' },
  argTypes: {
    theme: { control: 'inline-radio', options: ['light', 'dark', 'system'] },
    shell: { control: 'inline-radio', options: ['desktop', 'mobile'] },
    state: { control: 'select', options: ['loaded', 'empty', 'loading', 'error', 'denied'] },
  },
  args: { file:'./v2/missioncontrol.html', product:true, state:'loaded', shell:'desktop', theme:'light', hash:'#/a-intel/core-platform' },
  render: view,
};
export const FleetLight = {
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('iframe');
    await waitFor(() => expect(frame.contentDocument?.querySelectorAll('[data-run]').length).toBe(25), {timeout:15000});
    const doc = frame.contentDocument;
    await userEvent.selectOptions(doc.querySelector('[aria-label="Rows per page"]'), '10');
    await expect(doc.querySelectorAll('[data-run]').length).toBe(10);
    await userEvent.click(doc.querySelector('[aria-label="Next page"]'));
    await expect(doc.querySelector('.v2-pager').textContent).toContain('11–20');
    await userEvent.selectOptions(doc.querySelector('[aria-label="Filter by harness"]'), 'cursor');
    await expect([...doc.querySelectorAll('[data-run] .v2-harness')].every(node => node.textContent === 'Cursor')).toBe(true);
    await userEvent.selectOptions(doc.querySelector('[aria-label="Filter by harness"]'), '');
    await userEvent.selectOptions(doc.querySelector('[aria-label="Rows per page"]'), '25');
    await expect(doc.querySelectorAll('[data-run]').length).toBe(25);
  },
};
export const FleetDark = { args: { theme:'dark' } };
export const FleetMobile = { args: { shell:'mobile' } };
export const FleetEmpty = { args: { state:'empty' } };
export const FleetLoading = { args: { state:'loading' } };
export const FleetError = { args: { state:'error' } };
export const FleetAccessDenied = { args: { state:'denied' } };
export const Coaching = { args: { hash:'#/a-intel/core-platform/coaching' } };
export const CoachingDark = { args: { hash:'#/a-intel/core-platform/coaching',theme:'dark' } };
export const Spend = { args: { hash:'#/a-intel/core-platform/spend' } };
export const SpendDark = { args: { hash:'#/a-intel/core-platform/spend',theme:'dark' } };
export const SharedContext = { args: { hash:'#/a-intel/core-platform/steering' } };
export const Run = { args: { hash:'#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW' } };
export const Agents = { args: { hash:'#/a-intel/core-platform/agents' } };
export const Skills = { args: { hash:'#/a-intel/core-platform/steering/skills' } };
export const Tools = { args: { hash:'#/a-intel/core-platform/tools' } };
export const Repositories = { args: { hash:'#/a-intel/core-platform/repositories' } };
export const Register = { args: { hash:'#/a-intel/core-platform/register/name' } };
