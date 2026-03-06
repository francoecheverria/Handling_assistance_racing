<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'apellido',
        'dni',
        'numero_socio',
        'fecha_nacimiento',
        'category_id',
        'medical_check',
        'imagen_compromiso',
        'registered',
        'scholarship',
        'notes',
        'telefono',
        'mail',
    ];

    /**
     * @var list<string>
     */
    protected $appends = ['full_name'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'medical_check' => 'boolean',
            'imagen_compromiso' => 'boolean',
            'registered' => 'boolean',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([$this->nombre, $this->apellido])));
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getCategoryYearAttribute(): ?int
    {
        return $this->relationLoaded('category') ? $this->category?->category_year : null;
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
