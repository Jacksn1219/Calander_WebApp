namespace Calender_WebApp.Services
{
    /// <summary>
    /// Service for managing Employee entities.
    /// </summary>
    public class EmployeesService : CrudService<EmployeeModel>, IEmployeeService
    {
        private readonly DatabaseContext _context;

        public EmployeesService(DatabaseContext ctx) : base(ctx)
        {
            _context = ctx;
        }

        /// <summary>
        /// Gets an employee by their email address.
        /// </summary>
        /// <param name="email">The employee's email.</param>
        /// <returns>The employee if found; otherwise, null.</returns>
        public async Task<EmployeeModel?> GetEmployeeByEmailAsync(string email)
        {
            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Email == email);
        }

        // Add additional services that are not related to CRUD here
    }
}