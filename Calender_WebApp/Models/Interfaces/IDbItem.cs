using System;

namespace Calender_WebApp.Models.Interfaces
{
    public interface IDbItem
    {
        int? Id { get; set; }
    }

    public interface IDbItemJunction
    {
        // Marker interface for junction tables
    }
}