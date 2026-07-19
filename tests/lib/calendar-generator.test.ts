import {
  getTemplateForRole,
  generateInterviewPrepCalendar,
  createGeneralPrepCalendar,
  inferRoleType,
} from '@/lib/calendar-generator';

describe('Calendar Generator', () => {
  describe('getTemplateForRole', () => {
    test('should return backend template for backend roles', () => {
      const template = getTemplateForRole('Backend Engineer');
      expect(template).toBeDefined();
      expect(template.length).toBeGreaterThan(0);
      expect(template.some(t => t.title.toLowerCase().includes('system design'))).toBe(true);
    });

    test('should return frontend template for frontend roles', () => {
      const template = getTemplateForRole('Frontend Engineer');
      expect(template).toBeDefined();
      expect(template.some(t => t.title.toLowerCase().includes('react'))).toBe(true);
    });

    test('should return ML template for ML roles', () => {
      const template = getTemplateForRole('ML Engineer');
      expect(template).toBeDefined();
      expect(template.some(t => t.title.toLowerCase().includes('statistics'))).toBe(true);
    });

    test('should return general template for unknown roles', () => {
      const template = getTemplateForRole('DevOps Engineer');
      expect(template).toBeDefined();
      expect(template.some(t => t.title.toLowerCase().includes('resume'))).toBe(true);
    });

    test('should be case-insensitive', () => {
      const template1 = getTemplateForRole('BACKEND ENGINEER');
      const template2 = getTemplateForRole('backend engineer');
      expect(template1.length).toBe(template2.length);
    });
  });

  describe('generateInterviewPrepCalendar', () => {
    const today = new Date();

    test('should generate tasks for interview 2 weeks away', () => {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 14);

      const tasks = generateInterviewPrepCalendar(futureDate, 5, 'Backend Engineer');
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks.every(t => t.dueDate <= futureDate)).toBe(true);
    });

    test('should generate backend interview tasks', () => {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 21);

      const tasks = generateInterviewPrepCalendar(futureDate, 5, 'Backend Engineer');
      expect(tasks.some(t => t.title.toLowerCase().includes('system design'))).toBe(true);
    });

    test('should generate frontend interview tasks', () => {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 21);

      const tasks = generateInterviewPrepCalendar(futureDate, 5, 'Frontend Engineer');
      expect(tasks.some(t => t.title.toLowerCase().includes('react'))).toBe(true);
    });

    test('should handle interview within 7 days (intensive schedule)', () => {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 3);

      const tasks = generateInterviewPrepCalendar(futureDate, 5, 'Backend Engineer');
      expect(tasks.length).toBeGreaterThan(0);
    });

    test('should return empty for interview in past', () => {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - 1);

      const tasks = generateInterviewPrepCalendar(pastDate, 5, 'Backend Engineer');
      expect(tasks.length).toBe(0);
    });

    test('should have event type "interview"', () => {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 14);

      const tasks = generateInterviewPrepCalendar(futureDate, 5, 'Backend Engineer');
      expect(tasks.every(t => t.eventType === 'interview')).toBe(true);
    });

    test('should have estimated hours', () => {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 14);

      const tasks = generateInterviewPrepCalendar(futureDate, 5, 'Backend Engineer');
      tasks.forEach(task => {
        expect(task.estimatedHours).toBeGreaterThan(0);
      });
    });
  });

  describe('createGeneralPrepCalendar', () => {
    test('should generate general prep calendar', () => {
      const tasks = createGeneralPrepCalendar();
      expect(tasks.length).toBeGreaterThan(0);
    });

    test('should have event type "general"', () => {
      const tasks = createGeneralPrepCalendar();
      expect(tasks.every(t => t.eventType === 'general')).toBe(true);
    });

    test('should have valid due dates', () => {
      const tasks = createGeneralPrepCalendar();
      const today = new Date();
      tasks.forEach(task => {
        expect(task.dueDate).toBeInstanceOf(Date);
        expect(task.dueDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
      });
    });
  });

  describe('inferRoleType', () => {
    test('should infer backend from job title', () => {
      const roleType = inferRoleType('Backend Engineer');
      expect(roleType).toBe('backend');
    });

    test('should infer frontend from job title', () => {
      const roleType = inferRoleType('Frontend Engineer');
      expect(roleType).toBe('frontend');
    });

    test('should infer ML from job title', () => {
      const roleType = inferRoleType('Machine Learning Engineer');
      expect(roleType).toBe('ml');
    });

    test('should infer general for unknown roles', () => {
      const roleType = inferRoleType('DevOps Engineer');
      expect(roleType).toBe('general');
    });

    test('should be case-insensitive', () => {
      const roleType1 = inferRoleType('BACKEND ENGINEER');
      const roleType2 = inferRoleType('backend engineer');
      expect(roleType1).toBe(roleType2);
    });
  });
});
