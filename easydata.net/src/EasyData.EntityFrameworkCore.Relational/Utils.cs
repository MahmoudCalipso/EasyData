﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Microsoft.EntityFrameworkCore.Metadata;

namespace EasyData.EntityFrameworkCore
{
    internal static class Utils
    {
        public static string GetEntityNameByType(IEntityType entityType)
        {
            return entityType.ClrType.Name.Split('`').First();
        }
    }
}
