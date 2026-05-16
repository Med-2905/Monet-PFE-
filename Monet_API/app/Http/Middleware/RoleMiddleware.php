<?php

namespace App\Http\Middleware;

use App\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    /*
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        /*

        $user = auth('api')->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        $userRole = $user->role instanceof UserRole
            ? $user->role->value
            : $user->role;

        if (! in_array($userRole, $roles, true)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission.',
            ], 403);
        }


        return $next($request);
       $validRoles = array_map(
            fn (UserRole $role) => $role->value,
            UserRole::cases()
        );

        foreach ($roles as $role) {
            if (! in_array($role, $validRoles, true)) {
                abort(500, "Invalid role '{$role}' in middleware. Valid roles: " . implode(', ', $validRoles));
            }
        }

        $user = auth('api')->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        $userRole = $user->role instanceof UserRole
            ? $user->role->value
            : $user->role;

        if (! in_array($userRole, $roles, true)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission.',
            ], 403);
        }

        return $next($request);
    }*/
        public function handle(Request $request, Closure $next, string ...$roles): Response
    {
       $user = auth('api')->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        $userRole = $user->role instanceof UserRole
            ? $user->role->value
            : $user->role;

        if (! in_array($userRole, $roles, true)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission.',
            ], 403);
        }

        return $next($request);
    }
}
