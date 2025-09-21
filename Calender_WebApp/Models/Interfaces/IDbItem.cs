using System;

namespace Calender_WebApp.Models.Interfaces
{
    /// <summary>
    /// Interface for database items with an integer ID.
    /// This interface implies the model is COMPATIBLE with the generic CRUD operations.
    /// </summary>
    public interface IDbItem
    {
        int? Id { get; set; }
    }

    /// <summary>
    /// Interface for junction table items.
    /// This interface is used to mark models that represent many-to-many relationships.
    /// This interface implies the model is INCOMPATIBLE with the generic CRUD operations.
    /// </summary>
    public interface IDbItemJunction
    {
        // Marker interface for junction tables
    }
}